// Add to your database files
import { getPool } from "./setup.db.js";
export async function checkUserPermission(roleId, permissionName) {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT p.name 
      FROM permissions p
      JOIN rolepermissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${roleId} AND p.name = ${permissionName}
    `;
    return result.length > 0;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}