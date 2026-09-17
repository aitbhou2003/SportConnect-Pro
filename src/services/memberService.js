const pool = require("../config/database")

async function getAllMenmbers() {
    const result = await pool.query(`
        SELECT * FROM members 
        ORDER BY id
        `);

    return result.rows;
}


async function getMemberById(id) {
    const result = await pool.query(`
        SELECT * FROM members
        WHERE id = $1
        `, [id]);

    return result.rows[0]
}


module.exports = {
    getAllMenmbers,
    getMemberById
}

