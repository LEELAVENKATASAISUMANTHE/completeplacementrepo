import { getPool } from "./setup.db.js";

export async function createPermissions(data) {
  const sql = getPool();
  try {
    await sql`
      INSERT INTO permissions (name, description)
      VALUES
        (${data.name}, ${data.description})
    `;
  } catch (error) {
    console.error("Error creating permissions:", error);
    throw error;
  }
}

export async function getPermissions() {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT * FROM permissions
    `;
    return result;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
}
export async function updatePermission(id, data) {
  const sql = getPool();
  try {
    await sql`
      UPDATE permissions
      SET name = ${data.name}, description = ${data.description}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error updating permission:", error);
    throw error;
  }
}
export async function deletePermission(id) {
  const sql = getPool();
  try {
    await sql`
      DELETE FROM permissions
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error deleting permission:", error);
    throw error;
  }
}
export async function getPermissionById(id) {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT * FROM permissions
      WHERE id = ${id}
    `;
    return result;
  } catch (error) {
    console.error("Error fetching permission:", error);
    throw error;
  }
}

export async function getPermissionByName(name) {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT * FROM permissions
      WHERE name LIKE ${`%${name}%`}
    `;
    return result;
  } catch (error) {
    console.error("Error fetching permission:", error);
    throw error;
  }
}