import { getPool } from "./setup.db.js";

/**
 * Create a notice in the database
 * Fields: author (string), content (string), type (string), is_public (boolean)
 */
export const createNotice = async (data) => {
  const pool = getPool();
  try {
    const result = await pool.query(
      `INSERT INTO notices (author, content, type, is_public, expires_at)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.author, data.content, data.type, data.is_public, data.expires_at]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creating notice:", error);
    throw error;
  }
};

export const deleteNoticeById = async (id) => {
  const pool = getPool();
  const result = await pool.query("DELETE FROM notices WHERE id = $1", [id]);
  return result;
};

export const getNoticeById = async (id) => {
  const pool = getPool();
  try {
    const res = await pool.query("SELECT * FROM notices WHERE id = $1", [id]);
    return res.rows[0];
  } catch (error) {
    console.error("Error fetching notice by ID:", error);
    throw error;
  }
};

export async function fetchAndFormatAllNotices() {
  console.log("Fetching all notices from the DATABASE...");
  const pool = getPool();
  try {
    const res = await pool.query(`
      SELECT n.*
      FROM notices n
      WHERE n.is_public = true
      ORDER BY n.created_at DESC
    `);
    const raw = res.rows;
    const formatted = raw.map(n => ({
      id: n.id,
      author: n.author,
      content: n.content,
      type: n.type,
      isPublic: n.is_public,
      createdAt: n.created_at,
      expiresAt: n.expires_at
    }));
    return formatted;
  } catch (error) {
    console.error("Failed to fetch and format notices:", error);
    return [];
  }
}
