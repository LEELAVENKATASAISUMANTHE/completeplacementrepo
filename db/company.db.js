import { getPool } from "./setup.db.js";

export const createcompany = async (data) => {
  const pool = getPool();

    const result = await pool.query(
      "INSERT INTO companies (name, email, logo,description,headquarters,sub_branch_location) VALUES ($1, $2, $3, $4, $5, $6)",
      [data.name, data.email, data.logo, data.description, data.headquarters, data.sub_branch_location]
    );
  return result;
};

export const deleteCompanyById = async (id) => {
  const pool = getPool();
  const result = await pool.query("DELETE FROM companies WHERE id = $1", [id]);
  return result;
};

export const getCompanyById = async (id) => {
  const pool = getPool();
  const result = await pool.query("SELECT * FROM companies WHERE id = $1", [id]);
  return result.rows[0];
};

export const updateCompanyById = async (id, data) => {
  const pool = getPool();
  const result = await pool.query(
    "UPDATE companies SET name = $1, email = $2, logo = $3, description = $4, headquarters = $5, sub_branch_location = $6 WHERE id = $7",
    [data.name, data.email, data.logo, data.description, data.headquarters, data.sub_branch_location, id]
  );
  return result;
};

export const getAllCompanies = async () => {
  const pool = getPool();
  const result = await pool.query("SELECT * FROM companies ORDER BY created_at DESC");
  return result.rows;
};

export const searchCompanies = async (searchTerm) => {
  const pool = getPool();
  const result = await pool.query(
    "SELECT * FROM companies WHERE name ILIKE $1 OR email ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC",
    [`%${searchTerm}%`]
  );
  return result.rows;
};
