// Updated role.db.js - Fix table name consistency
import { getPool } from "./setup.db.js";

export async function createRoles(data) {
  const sql = getPool();
  try {
    await sql`
      INSERT INTO roles (name, description, is_active)
      VALUES (${data.name}, ${data.description}, ${data.is_active})
    `;
  } catch (error) {
    console.error("Error creating roles:", error);
    throw error;
  }
}

export async function getRoles() {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT * FROM roles ORDER BY id
    `;
    return result;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
}

export async function updateRole(id, data) {
  const sql = getPool();
  try {
    await sql`
      UPDATE roles
      SET name = ${data.name}, 
          description = ${data.description}, 
          is_active = ${data.is_active}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
}   

export async function deleteRole(id) {
  const sql = getPool();
  try {
    // Check if role has users first
    const usersWithRole = await sql`
      SELECT COUNT(*) as count FROM users WHERE role_id = ${id}
    `;
    
    if (usersWithRole[0].count > 0) {
      throw new Error(`Cannot delete role. ${usersWithRole[0].count} users are assigned to this role.`);
    }
    
    await sql`
      DELETE FROM roles WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
}

export async function getRoleById(id) {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT * FROM roles WHERE id = ${id}
    `;
    return result;
  } catch (error) {
    console.error("Error fetching role:", error);
    throw error;
  }
}

export async function getRoleByName(name) {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT * FROM roles WHERE name ILIKE ${`%${name}%`}
    `;
    return result;
  } catch (error) {
    console.error("Error fetching role:", error);
    throw error;
  }
}

// New function to check if user has permission
export async function checkUserPermission(userId, permissionName) {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT user_has_permission(${userId}, ${permissionName}) as has_permission
    `;
    return result[0]?.has_permission || false;
  } catch (error) {
    console.error("Error checking user permission:", error);
    return false;
  }
}

// Updated rolepermission.db.js - Fix table name consistency

export async function assignPermissionToRole(roleId, permissionId) {
  const sql = getPool();
  try {
    // Use INSERT ON CONFLICT to prevent duplicates
    await sql`
      INSERT INTO rolepermissions (role_id, permission_id)
      VALUES (${roleId}, ${permissionId})
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `;
  } catch (error) {
    console.error("Error assigning permission to role:", error);
    throw error;
  }
}

export async function removePermissionFromRole(roleId, permissionId) {
  const sql = getPool();
  try {
    await sql`
      DELETE FROM rolepermissions
      WHERE role_id = ${roleId} AND permission_id = ${permissionId}
    `;
  } catch (error) {
    console.error("Error removing permission from role:", error);
    throw error;
  }
}

export async function getAllRolePermissions() {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT * FROM role_permissions_detailed
      ORDER BY role_name, permission_name
    `;
    return result;
  } catch (error) {
    console.error("Error fetching all role permissions:", error);
    throw error;
  }
}

export async function getallpermissionbyroleid(roleId) {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT p.*
      FROM permissions p
      JOIN rolepermissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${roleId}
      ORDER BY p.name
    `;
    return result;
  } catch (error) {
    console.error("Error fetching all permissions by role ID:", error);
    throw error;
  }
}

export async function getallrolebypermissionid(permissionId) {
  const sql = getPool();
  try {
    const result = await sql`
      SELECT r.*
      FROM roles r
      JOIN rolepermissions rp ON r.id = rp.role_id
      WHERE rp.permission_id = ${permissionId}
      ORDER BY r.name
    `;
    return result;
  } catch (error) {
    console.error("Error fetching all roles by permission ID:", error);
    throw error;
  }
}