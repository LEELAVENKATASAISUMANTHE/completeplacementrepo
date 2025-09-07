// Add to your database files
import { getPool } from './setup.db.js';

export async function checkUserPermission(roleId, permissionName) {
  const pool = getPool();
  try {
    const res = await pool.query(
      `SELECT p.name FROM permissions p JOIN rolepermissions rp ON p.id = rp.permission_id WHERE rp.role_id = $1 AND p.name = $2`,
      [roleId, permissionName]
    );
    return res.rows.length > 0;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}