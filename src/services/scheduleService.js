const pool = require("../config/database");

async function checkTimeCollision(
    facilityId,
    weekday,
    startTime,
    endTime,
    subzone
) {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            start_time,
            end_time,
            subzone
        FROM activities
        WHERE facility_id = $1
          AND weekday = $2

          AND start_time < $4
          AND $3 < end_time

          AND (
              subzone = $5
              OR subzone IS NULL
              OR $5 IS NULL
          )
        `,
        [
            facilityId,
            weekday,
            startTime,
            endTime,
            subzone
        ]
    );

    return result.rows;
}

async function checkFacilityCapacity(facilityId, maxCapacity) {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            erp_capacity
        FROM facilities
        WHERE id = $1
        `,
        [facilityId]
    );

    const facility = result.rows[0];

    if (!facility) {
        return {
            valid: false,
            reason: "facility_not_found"
        };
    }

    if (maxCapacity > facility.erp_capacity) {
        return {
            valid: false,
            reason: "activity_capacity_exceeds_facility_capacity",
            facility
        };
    }

    // Capacity is valid
    return {
        valid: true,
        facility
    };
}

module.exports = {
    checkTimeCollision,
    checkFacilityCapacity
};