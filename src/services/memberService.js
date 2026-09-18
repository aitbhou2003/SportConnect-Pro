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
        WHERE members.id = $1
        `, [id]);

    return result.rows[0]
}

async function createMember(
    name,
    birthDate,
    resident,
    qf,
    medicalCertificateDate,
    familyId
) {

    const result = await pool.query(`
        INSERT INTO members (
            name,
            birth_date,
            resident,
            qf,
            medical_certificate_date,
            family_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `, [
        name,
        birthDate,
        resident,
        qf,
        medicalCertificateDate,
        familyId
    ]);

    return result.rows[0];
}


module.exports = {
    getAllMenmbers,
    getMemberById,
    createMember
}

