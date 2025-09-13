import { getPool } from "./setup.db.js";



export const createJob = async (data) => {
  const pool = getPool();
  try {
    const result = await pool.query(
      `INSERT INTO jobs
         (company_id, title, description, req_skills, salary_range,
          start_date, end_date, location, is_active)
       VALUES ($1,$2,$3,$4::text[],$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        data.company_id,
        data.title,
        data.description,
        data.req_skills,      // still a JS array of strings
        data.salary_range,
        data.start_date,
        data.end_date,
        data.location,
        data.is_active
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

export const deletejobById = async (id) => {
  const pool = getPool();
  const result = await pool.query("DELETE FROM jobs WHERE id = $1", [id]);
  return result;
};


export const updateJobById = async (id, data) => {
  const pool = getPool();
  const result = await pool.query(
    `UPDATE jobs SET company_id = $1, title = $2, description = $3, req_skills = $4, salary_range = $5, start_date = $6, end_date = $7, location = $8, is_active = $9
     WHERE id = $10 RETURNING *`,
    [data.company_id, data.title, data.description, data.req_skills, data.salary_range, data.start_date, data.end_date, data.location, data.is_active, id]
  );
  return result.rows[0];
};

export const getJobById = async (id) => {
  const pool = getPool();
    try {
        const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching job by ID:", error);
        throw error;
    }
};

/**
 * Fetches all job listings from the database and formats them.
 * This function will be the single source of truth for job data.
 * Both REST and GraphQL will use it.
 *
 * @returns {Promise<Array>} A list of neatly formatted job objects.
 */
export async function fetchAndFormatAllJobs() {
  console.log("Fetching all jobs from the DATABASE...");
  const pool = getPool();
  try {
    // 1. Fetch the raw data from the database.
    const res = await pool.query(`
      SELECT 
        j.*, 
        c.name as company_name 
      FROM 
        jobs j
      LEFT JOIN 
        companies c ON j.company_id = c.id
      ORDER BY 
        j.created_at DESC
    `);
    const rawJobs = res.rows;

    // 2. Reorder and format the data "neatly".
    // This step ensures the data matches the structure you want,
    // which should be the same as your GraphQL 'Job' type.
    const formattedJobs = rawJobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      reqSkills: job.req_skills, // Assuming this is already an array in the DB
      salaryRange: job.salary_range,
      company: { // Nested object, just like in your GraphQL schema
        id: job.company_id,
        name: job.company_name
      },
      location: job.location,
      isActive: job.is_active,
      startDate: job.start_date,
      endDate: job.end_date,
      // ... add any other fields you need
    }));

    return formattedJobs;
    
  } catch (error) {
    console.error("Failed to fetch and format jobs:", error);
    // Return an empty array or throw the error, depending on your error handling strategy.
    return [];
  }
};
