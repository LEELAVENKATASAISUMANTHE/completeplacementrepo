// Updated role.db.js - Fix table name consistency
import { getPool } from './setup.db.js';

export async function createRoles(data) {
  const pool = getPool();
  try {
    await pool.query('INSERT INTO roles (name, description, is_active) VALUES ($1, $2, $3)', [data.name, data.description, data.is_active]);
  } catch (error) {
    console.error('Error creating roles:', error);
    throw error;
  }
}

export async function getRoles() {
  const pool = getPool();
  try {
    const res = await pool.query('SELECT * FROM roles ORDER BY id');
    return res.rows;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
}

export async function updateRole(id, data) {
  const pool = getPool();
  try {
    await pool.query('UPDATE roles SET name = $1, description = $2, is_active = $3 WHERE id = $4', [data.name, data.description, data.is_active, id]);
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
}

export async function deleteRole(id) {
  const pool = getPool();
  try {
    const usersWithRole = await pool.query('SELECT COUNT(*) as count FROM users WHERE role_id = $1', [id]);
    if (parseInt(usersWithRole.rows[0].count, 10) > 0) {
      throw new Error(`Cannot delete role. ${usersWithRole.rows[0].count} users are assigned to this role.`);
    }
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
}

export async function getRoleById(id) {
  const pool = getPool();
  try {
    const res = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    return res.rows[0];
  } catch (error) {
    console.error('Error fetching role:', error);
    throw error;
  }
}

export async function getRoleByName(name) {
  const pool = getPool();
  try {
    const res = await pool.query('SELECT * FROM roles WHERE name ILIKE $1', [`%${name}%`]);
    return res.rows;
  } catch (error) {
    console.error('Error fetching role:', error);
    throw error;
  }
}

// New function to check if user has permission
export async function checkUserPermission(userId, permissionName) {
  const pool = getPool();
  try {
    const res = await pool.query('SELECT user_has_permission($1, $2) as has_permission', [userId, permissionName]);
    return res.rows[0]?.has_permission || false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

export async function assignPermissionToRole(roleId, permissionId) {
  const pool = getPool();
  try {
    await pool.query('INSERT INTO rolepermissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT (role_id, permission_id) DO NOTHING', [roleId, permissionId]);
  } catch (error) {
    console.error('Error assigning permission to role:', error);
    throw error;
  }
}

export async function removePermissionFromRole(roleId, permissionId) {
  const pool = getPool();
  try {
    await pool.query('DELETE FROM rolepermissions WHERE role_id = $1 AND permission_id = $2', [roleId, permissionId]);
  } catch (error) {
    console.error('Error removing permission from role:', error);
    throw error;
  }
}

export async function getAllRolePermissions() {
  const pool = getPool();
  try {
    const res = await pool.query('SELECT * FROM role_permissions_detailed ORDER BY role_name, permission_name');
    return res.rows;
  } catch (error) {
    console.error('Error fetching all role permissions:', error);
    throw error;
  }
}

export async function getallpermissionbyroleid(roleId) {
  const pool = getPool();
  try {
    const res = await pool.query(`SELECT p.* FROM permissions p JOIN rolepermissions rp ON p.id = rp.permission_id WHERE rp.role_id = $1 ORDER BY p.name`, [roleId]);
    return res.rows;
  } catch (error) {
    console.error('Error fetching all permissions by role ID:', error);
    throw error;
  }
}

export async function getallrolebypermissionid(permissionId) {
  const pool = getPool();
  try {
    const res = await pool.query(`SELECT r.* FROM roles r JOIN rolepermissions rp ON r.id = rp.role_id WHERE rp.permission_id = $1 ORDER BY r.name`, [permissionId]);
    return res.rows;
  } catch (error) {
    console.error('Error fetching all roles by permission ID:', error);
    throw error;
  }
}