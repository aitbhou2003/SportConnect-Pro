const pool = require("../config/database");

const pricingService = require("../services/pricingService");
const eligibilityService = require("../services/eligibilityService");
const memberService = require("../services/memberService");
const activityService = require("../services/activityService");

const renderer = require("../core/renderer");


async function getCheckoutPage(request, response, params) {
    try {
        const activityId = Number(params.id);

        if (
            !Number.isInteger(activityId) ||
            activityId <= 0
        ) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 400,
                    message: "Invalid activity ID"
                },
                400
            );

            return;
        }

        const activity =
            await activityService.getActivityById(activityId);

        if (!activity) {
            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 404,
                    message: "Activity not found"
                },
                404
            );

            return;
        }

        const members =
            await memberService.getAllMenmbers();

        await renderer.renderPage(
            response,
            "checkout",
            {
                activity,
                members
            }
        );

    } catch (error) {
        console.error(
            "Checkout page error:",
            error
        );

        await renderer.renderPage(
            response,
            "error",
            {
                statusCode: 500,
                message: "Internal server error"
            },
            500
        );
    }
}


async function registerMember(request, response) {

    let body = "";

    request.on("data", (chunk) => {
        body += chunk;
    });

    request.on("end", async () => {

        let client;

        try {


            const formData = new URLSearchParams(body);

            const memberId =
                Number(formData.get("member_id"));

            const activityId =
                Number(formData.get("activity_id"));

            const hasPassSport =
                formData.get("has_pass_sport") === "true";


           
            if (
                !Number.isInteger(memberId) ||
                memberId <= 0 ||
                !Number.isInteger(activityId) ||
                activityId <= 0
            ) {
                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Invalid member or activity ID"
                    },
                    400
                );

                return;
            }

            client = await pool.connect();


        
            await client.query("BEGIN");


            const memberResult =
                await client.query(
                    `
                    SELECT *
                    FROM members
                    WHERE id = $1
                    `,
                    [memberId]
                );


            if (memberResult.rows.length === 0) {

                await client.query("ROLLBACK");

                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 404,
                        message: "Member not found"
                    },
                    404
                );

                return;
            }


            const member =
                memberResult.rows[0];


            /*
             * Lock the activity row.
             *
             * This is the important part
             * for preventing overbooking.
             */
            const activityResult =
                await client.query(
                    `
                    SELECT *
                    FROM activities
                    WHERE id = $1
                    FOR UPDATE
                    `,
                    [activityId]
                );


            if (activityResult.rows.length === 0) {

                await client.query("ROLLBACK");

                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 404,
                        message: "Activity not found"
                    },
                    404
                );

                return;
            }


            const activity =
                activityResult.rows[0];


            /*
             * AGE ELIGIBILITY
             */
            const memberAgeCategory =
                eligibilityService.calculateAgeCategory(
                    member.birth_date
                );


            const ageAllowed =
                eligibilityService.verifyAgeEligibility(
                    memberAgeCategory,
                    activity.age_category
                );


            if (!ageAllowed) {

                await client.query("ROLLBACK");

                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            `Registration refused. ` +
                            `Member category: ${memberAgeCategory}. ` +
                            `Required category: ${activity.age_category}.`
                    },
                    400
                );

                return;
            }


            /*
             * MEDICAL ELIGIBILITY
             */
            const medicalStatus =
                eligibilityService.checkMedicalCompliance(
                    member.medical_certificate_date,
                    activity.name
                );


            if (medicalStatus === "medical_non_compliant") {

                await client.query("ROLLBACK");

                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 400,
                        message:
                            "Registration refused: medical certificate is not compliant."
                    },
                    400
                );

                return;
            }


            /*
             * Calculate the price using
             * the SAME transaction client.
             */
            const pricing =
                await pricingService.calculatePricingDetails(
                    client,
                    memberId,
                    activityId,
                    hasPassSport
                );


            /*
             * Count confirmed registrations.
             *
             * Because the activity row is locked,
             * another registration for this activity
             * must wait for this transaction.
             */
            const countResult =
                await client.query(
                    `
                    SELECT COUNT(*) AS total
                    FROM registrations
                    WHERE activity_id = $1
                      AND status = 'confirmed'
                    `,
                    [activityId]
                );


            const currentCount =
                Number(countResult.rows[0].total);


            /*
             * CASE 1:
             * Activity is full.
             */
            if (
                currentCount >=
                activity.max_capacity
            ) {

                /*
                 * Residents get +10 priority points.
                 */
                const priorityScore =
                    member.resident ? 10 : 0;


                await client.query(
                    `
                    INSERT INTO waiting_list (
                        activity_id,
                        member_id,
                        priority_score,
                        status
                    )
                    VALUES ($1, $2, $3, 'waiting')
                    `,
                    [
                        activityId,
                        memberId,
                        priorityScore
                    ]
                );


                await client.query("COMMIT");


                await renderer.renderPage(
                    response,
                    "registration-result",
                    {
                        status: "waitlisted",
                        message:
                            "The activity is full. You have been added to the waiting list.",
                        activity,
                        member,
                        pricing,
                        priorityScore
                    }
                );

                return;
            }


            /*
             * CASE 2:
             * There is an available place.
             */
            await client.query(
                `
                INSERT INTO registrations (
                    member_id,
                    activity_id,
                    final_price,
                    status
                )
                VALUES ($1, $2, $3, 'confirmed')
                `,
                [
                    memberId,
                    activityId,
                    pricing.final_price
                ]
            );


            /*
             * COMMIT
             */
            await client.query("COMMIT");


            await renderer.renderPage(
                response,
                "registration-result",
                {
                    status: "confirmed",
                    message:
                        "Registration confirmed successfully.",
                    activity,
                    member,
                    pricing
                }
            );

        } catch (error) {

            console.error(
                "Registration transaction error:",
                error
            );


            /*
             * If a transaction has started,
             * cancel it.
             */
            if (client) {
                try {
                    await client.query("ROLLBACK");
                } catch (rollbackError) {
                    console.error(
                        "Rollback error:",
                        rollbackError
                    );
                }
            }


            /*
             * Handle PostgreSQL unique constraint.
             */
            if (
                error.code === "23505"
            ) {

                await renderer.renderPage(
                    response,
                    "error",
                    {
                        statusCode: 409,
                        message:
                            "This member is already registered or already present in the waiting list for this activity."
                    },
                    409
                );

                return;
            }


            await renderer.renderPage(
                response,
                "error",
                {
                    statusCode: 500,
                    message:
                        "Unable to process the registration."
                },
                500
            );

        } finally {

            /*
             * Always return the connection
             * to the pool.
             */
            if (client) {
                client.release();
            }
        }
    });
}


module.exports = {
    getCheckoutPage,
    registerMember
};