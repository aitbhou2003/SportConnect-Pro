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
    [id],
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
  subzone,
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
      subzone,
    ],
  );

  return result.rows[0];
}

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity
};
