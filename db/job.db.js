import { getPool } from "./setup.db.js";

const pool = getPool();

export const createJob = async (data) => {
  const result = await pool.query(
    `INSERT INTO jobs (company_id,title, description,req_skills,salary_range,start_date,end_date, location, salary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [data.company_id, data.title, data.description, data.req_skills, data.salary_range, data.start_date, data.end_date, data.location, data.salary]
  );
  return result.rows[0];
};

export const deletejobById = async (id) => {
  const result = await pool.query("DELETE FROM jobs WHERE id = $1", [id]);
  return result;
};


export const updateJobById = async (id, data) => {
  const result = await pool.query(
    `UPDATE jobs SET company_id = $1, title = $2, description = $3, req_skills = $4, salary_range = $5, start_date = $6, end_date = $7, location = $8, salary = $9
     WHERE id = $10 RETURNING *`,
    [data.company_id, data.title, data.description, data.req_skills, data.salary_range, data.start_date, data.end_date, data.location, data.salary, id]
  );
  return result.rows[0];
};