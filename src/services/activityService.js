const pool = require("../config/database");

async function getAllActivities() {
    const result = await pool.query(`
        SELECT
            activities.*,
            associations.name AS association_name,
            facilities.name AS facility_name
        FROM activities
        LEFT JOIN associations
            ON activities.association_id = associations.id
        LEFT JOIN facilities
            ON activities.facility_id = facilities.id
        ORDER BY activities.id
    `);

    return result.rows;
}


async function getActivityById(id) {
    const result = await pool.query(
        `
        SELECT
            activities.*,
            associations.name AS association_name,
            facilities.name AS facility_name
        FROM activities
        LEFT JOIN associations
            ON activities.association_id = associations.id
        LEFT JOIN facilities
            ON activities.facility_id = facilities.id
        WHERE activities.id = $1
        `,
        [id]
    );

    return result.rows[0];
}


async function createActivity(
    name,
    basePrice,
    maxCapacity,
    ageCategory,
    associationId,
    facilityId,
    weekday,
    startTime,
    endTime,
    subzone
) {
    const result = await pool.query(
        `
        INSERT INTO activities (
            name,
            base_price,
            max_capacity,
            age_category,
            association_id,
            facility_id,
            weekday,
            start_time,
            end_time,
            subzone
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10
        )
        RETURNING *
        `,
        [
            name,
            basePrice,
            maxCapacity,
            ageCategory,
            associationId,
            facilityId,
            weekday,
            startTime,
            endTime,
            subzone
        ]
    );

    return result.rows[0];
}


async function updateActivity(
    id,
    name,
    basePrice,
    maxCapacity,
    ageCategory,
    associationId,
    facilityId,
    weekday,
    startTime,
    endTime,
    subzone
) {
    const result = await pool.query(
        `
        UPDATE activities
        SET
            name = $1,
            base_price = $2,
            max_capacity = $3,
            age_category = $4,
            association_id = $5,
            facility_id = $6,
            weekday = $7,
            start_time = $8,
            end_time = $9,
            subzone = $10
        WHERE id = $11
        RETURNING *
        `,
        [
            name,
            basePrice,
            maxCapacity,
            ageCategory,
            associationId,
            facilityId,
            weekday,
            startTime,
            endTime,
            subzone,
            id
        ]
    );

    return result.rows[0];
}


async function deleteActivity(id) {
    const result = await pool.query(
        `
        DELETE FROM activities
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
}

async function getAllAssociations() {
    const result = await pool.query(`
        SELECT id, name
        FROM associations
        ORDER BY name
    `);

    return result.rows;
}


async function getAllFacilities() {
    const result = await pool.query(`
        SELECT id, name, erp_capacity
        FROM facilities
        ORDER BY name
    `);

    return result.rows;
}


module.exports = {
    getAllActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity,
    getAllAssociations,
    getAllFacilities
};