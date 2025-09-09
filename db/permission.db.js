import { getPool } from './setup.db.js';

export async function createPermissions(data) {
  const pool = getPool();
  const text = 'INSERT INTO permissions (name, description) VALUES ($1, $2) RETURNING id';
  const values = [data.name, data.description];
  try {
    const res = await pool.query(text, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error creating permissions:', error);
    throw error;
  }
}



export async function deletePermission(id) {
  const pool = getPool();
  try {
    await pool.query('DELETE FROM permissions WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting permission:', error);
    throw error;
  }
}