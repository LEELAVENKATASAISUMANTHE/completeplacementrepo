import { BaseModel } from './BaseModel.js';

export class PermissionModel extends BaseModel {
  static tableName = 'permissions';

  static async create(permissionData) {
    const { name, description } = permissionData;
    const text = 'INSERT INTO permissions (name, description) VALUES ($1, $2) RETURNING *';
    const values = [name, description];
    
    const result = await this.query(text, values);
    return result.rows[0];
  }

  static async findByName(name) {
    const text = 'SELECT * FROM permissions WHERE name = $1';
    const result = await this.query(text, [name]);
    return result.rows[0] || null;
  }

  static async updateById(id, permissionData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(permissionData).forEach(key => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(permissionData[key]);
      paramIndex++;
    });

    values.push(id);
    const text = `UPDATE permissions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await this.query(text, values);
    return result.rows[0] || null;
  }

  static async checkNameExists(name, excludeId = null) {
    let text = 'SELECT id FROM permissions WHERE name = $1';
    let values = [name];
    
    if (excludeId) {
      text += ' AND id != $2';
      values.push(excludeId);
    }
    
    const result = await this.query(text, values);
    return result.rows.length > 0;
  }

  static async getPermissionsWithRoles() {
    const text = `
      SELECT 
        p.id, p.name, p.description, p.created_at, p.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', r.id,
              'name', r.name,
              'description', r.description,
              'is_active', r.is_active
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as roles
      FROM permissions p
      LEFT JOIN rolepermissions rp ON p.id = rp.permission_id
      LEFT JOIN roles r ON rp.role_id = r.id
      GROUP BY p.id, p.name, p.description, p.created_at, p.updated_at
      ORDER BY p.name
    `;
    const result = await this.query(text);
    return result.rows;
  }

  static async getUnassignedPermissions(roleId) {
    const text = `
      SELECT p.*
      FROM permissions p
      WHERE p.id NOT IN (
        SELECT rp.permission_id
        FROM rolepermissions rp
        WHERE rp.role_id = $1
      )
      ORDER BY p.name
    `;
    const result = await this.query(text, [roleId]);
    return result.rows;
  }

  static async bulkCreate(permissionsArray) {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const results = [];
      
      for (const permission of permissionsArray) {
        const text = 'INSERT INTO permissions (name, description) VALUES ($1, $2) RETURNING *';
        const values = [permission.name, permission.description];
        const result = await client.query(text, values);
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
