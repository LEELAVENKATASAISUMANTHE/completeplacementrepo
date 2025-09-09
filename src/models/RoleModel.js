import { BaseModel } from './BaseModel.js';

export class RoleModel extends BaseModel {
  static tableName = 'roles';

  static async create(roleData) {
    const { name, description } = roleData;
    const text = 'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *';
    const values = [name, description];
    
    const result = await this.query(text, values);
    return result.rows[0];
  }

  static async findByName(name) {
    const text = 'SELECT * FROM roles WHERE name = $1';
    const result = await this.query(text, [name]);
    return result.rows[0] || null;
  }

  static async getAllWithPermissions() {
    const text = `
      SELECT 
        r.id, r.name, r.description, r.is_active, r.created_at, r.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'name', p.name,
              'description', p.description
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as permissions
      FROM roles r
      LEFT JOIN rolepermissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id, r.name, r.description, r.is_active, r.created_at, r.updated_at
      ORDER BY r.id
    `;
    const result = await this.query(text);
    return result.rows;
  }

  static async getActiveRoles() {
    const text = 'SELECT * FROM roles WHERE is_active = true ORDER BY name';
    const result = await this.query(text);
    return result.rows;
  }

  static async updateById(id, roleData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(roleData).forEach(key => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(roleData[key]);
      paramIndex++;
    });

    values.push(id);
    const text = `UPDATE roles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await this.query(text, values);
    return result.rows[0] || null;
  }

  static async toggleActiveStatus(id) {
    const text = 'UPDATE roles SET is_active = NOT is_active WHERE id = $1 RETURNING *';
    const result = await this.query(text, [id]);
    return result.rows[0] || null;
  }

  static async checkNameExists(name, excludeId = null) {
    let text = 'SELECT id FROM roles WHERE name = $1';
    let values = [name];
    
    if (excludeId) {
      text += ' AND id != $2';
      values.push(excludeId);
    }
    
    const result = await this.query(text, values);
    return result.rows.length > 0;
  }

  static async getRolePermissions(roleId) {
    const text = `
      SELECT p.*
      FROM permissions p
      JOIN rolepermissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.name
    `;
    const result = await this.query(text, [roleId]);
    return result.rows;
  }

  static async getUsersWithRole(roleId) {
    const text = `
      SELECT u.id, u.name, u.email, u.is_active, u.created_at
      FROM users u
      WHERE u.role_id = $1
      ORDER BY u.name
    `;
    const result = await this.query(text, [roleId]);
    return result.rows;
  }
}
