const pool = require("../config/database")

async function getAllMenmbers() {
    const result = await pool.query(`
        SELECT 
        members.id,
        members.name,
        members.birth_date,
        members.resident,
        members.qf,
        members.medical_certificate_date,
        members.family_id,
        families.name AS family_name
        
        FROM members 
        JOIN families
                    ON members.family_id = families.id
        ORDER BY members.id
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

