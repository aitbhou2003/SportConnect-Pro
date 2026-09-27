const pool = require("../config/database");

async function calculatePricingDetails(
    client,
    memberId,
    activityId,
    hasPassSport = false
) {
    const memberResult = await client.query(
        `
        SELECT *
        FROM members
        WHERE id = $1
        `,
        [memberId]
    );

    const activityResult = await client.query(
        `
        SELECT *
        FROM activities
        WHERE id = $1
        `,
        [activityId]
    );

    if (
        memberResult.rows.length === 0 ||
        activityResult.rows.length === 0
    ) {
        throw new Error("Member or activity not found");
    }

    const member = memberResult.rows[0];
    const activity = activityResult.rows[0];

    let price = Number(activity.base_price);

    const breakdown = {
        base_price: price,
        adjustments: []
    };

    /*
     * 1. Resident / non-resident
     */
    if (!member.resident) {
        const increase = price * 0.35;

        price += increase;

        breakdown.adjustments.push({
            label: "Non-resident surcharge (+35%)",
            amount: Number(increase.toFixed(2))
        });
    }

    /*
     * 2. Family discount
     *
     * Count confirmed registrations
     * belonging to the same family.
     */
    if (member.family_id) {
        const familyResult = await client.query(
            `
            SELECT COUNT(r.id) AS count
            FROM registrations r
            JOIN members m
                ON r.member_id = m.id
            WHERE m.family_id = $1
              AND r.status = 'confirmed'
            `,
            [member.family_id]
        );

        const familyCount = Number(
            familyResult.rows[0].count
        );

        if (familyCount === 1) {
            const discount = price * 0.15;

            price -= discount;

            breakdown.adjustments.push({
                label: "Family discount -15%",
                amount: Number((-discount).toFixed(2))
            });
        }

        if (familyCount >= 2) {
            const discount = price * 0.30;

            price -= discount;

            breakdown.adjustments.push({
                label: "Family discount -30%",
                amount: Number((-discount).toFixed(2))
            });
        }
    }

    /*
     * 3. Quotient familial
     */
    const qf = Number(member.qf);

    if (qf < 600) {
        const discount = price * 0.40;

        price -= discount;

        breakdown.adjustments.push({
            label: "QF < 600€ (-40%)",
            amount: Number((-discount).toFixed(2))
        });
    } else if (qf <= 900) {
        const discount = price * 0.20;

        price -= discount;

        breakdown.adjustments.push({
            label: "QF 600€ - 900€ (-20%)",
            amount: Number((-discount).toFixed(2))
        });
    }

    /*
     * 4. Pass'Sport
     *
     * Your current database does not contain
     * a Pass'Sport code table.
     *
     * Therefore, at this stage the checkbox
     * represents a valid Pass'Sport.
     */
    if (hasPassSport) {
        price -= 50;

        breakdown.adjustments.push({
            label: "Pass'Sport (-50€)",
            amount: -50
        });
    }

    /*
     * 5. Minimum price
     */
    if (price < 15) {
        const adjustment = 15 - price;

        price = 15;

        breakdown.adjustments.push({
            label: "Minimum insurance price adjustment",
            amount: Number(adjustment.toFixed(2))
        });
    }

    /*
     * Final price
     */
    const finalPrice =
        Math.round(price * 100) / 100;

    breakdown.final_price = finalPrice;

    /*
     * 6. Payment in 3 installments
     *
     * 40% + 30% + remaining amount
     *
     * The last installment receives
     * the rounding difference.
     */
    const installment1 =
        Math.round(finalPrice * 0.40 * 100) / 100;

    const installment2 =
        Math.round(finalPrice * 0.30 * 100) / 100;

    const installment3 =
        Math.round(
            (finalPrice - installment1 - installment2) * 100
        ) / 100;

    breakdown.installments = [
        {
            percentage: "40%",
            amount: installment1,
            day: "J"
        },
        {
            percentage: "30%",
            amount: installment2,
            day: "J+30"
        },
        {
            percentage: "30%",
            amount: installment3,
            day: "J+60"
        }
    ];

    return breakdown;
}

module.exports = {
    calculatePricingDetails
};