const pool = require("../config/database");

async function getAllActivities() {
    const result = await pool.query(`
        SELECT *
        FROM activities
        ORDER BY id
    `);

    return result.rows;
}

async function getActivityById(id) {
    const result = await pool.query(
        `
        SELECT *
        FROM activities
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
}

module.exports = {
    getAllActivities,
    getActivityById
};