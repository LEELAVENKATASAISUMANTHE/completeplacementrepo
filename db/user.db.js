import { getPool } from './setup.db.js';
import { comparePassword } from '../utils/hash.js';

export async function createUsers(data) {
    const pool = getPool();
    const text = 'INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [data.name, data.email, data.password, data.role_id];
    try {
        const res = await pool.query(text, values);
        if (res.rowCount > 0) {
            return { success: true, message: 'User created successfully', id: res.rows[0].id };
        }
        return { success: false };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function getUsers() {
    const pool = getPool();
    try {
        const res = await pool.query('SELECT * FROM users ORDER BY id');
        return res.rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

export async function logincheck(email, password) {
    const pool = getPool();
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (res.rows.length > 0) {
            const user = res.rows[0];
            const isMatch = await comparePassword(password, user.password);
            if (isMatch) {
                return { success: true, user };
            }
        }
        return { success: false, message: 'Invalid email or password' };
    } catch (error) {
        console.error('Error checking login:', error);
        throw error;
    }
}

export async function deleteUserById(id) {
    const pool = getPool();
    try {
        const res = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        if (res.rowCount > 0) {
            return { success: true, message: 'User deleted successfully' };
        }
        return { success: false, message: 'User not found' };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

export async function userbyemail(email) {
    const pool = getPool();
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error;
    }
}