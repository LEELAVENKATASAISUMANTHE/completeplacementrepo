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

export async function getPermissions() {
  const pool = getPool();
  try {
    const res = await pool.query('SELECT * FROM permissions ORDER BY id');
    return res.rows;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
}

export async function updatePermission(id, data) {
  const pool = getPool();
  try {
    await pool.query('UPDATE permissions SET name = $1, description = $2 WHERE id = $3', [data.name, data.description, id]);
  } catch (error) {
    console.error('Error updating permission:', error);
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

export async function getPermissionById(id) {
  const pool = getPool();
  try {
    const res = await pool.query('SELECT * FROM permissions WHERE id = $1', [id]);
    return res.rows[0];
  } catch (error) {
    console.error('Error fetching permission:', error);
    throw error;
  }
}

export async function getPermissionByName(name) {
  const pool = getPool();
  try {
    const res = await pool.query('SELECT * FROM permissions WHERE name ILIKE $1', [`%${name}%`]);
    return res.rows;
  } catch (error) {
    console.error('Error fetching permission:', error);
    throw error;
  }
}