import { getPool } from "./setup.db.js";
import { comparePassword} from "../utils/hash.js";

export async function createUsers(data){
    const sql = getPool();
    try {
        const result = await sql`INSERT INTO Users (name, email, password, role_id) VALUES (${data.name}, ${data.email}, ${data.password}, ${data.role_id})`;
        if(result.count > 0){
            return { success: true, message: "User created successfully" };
        }
    } catch (error) {
        console.error("Error creating user:", error);
    }
}

export async function getUsers() {
    const sql = getPool();
    try {
        const result = await sql`SELECT * FROM Users`;
        return result;
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

export async function logincheck(email, password) {
    const sql = getPool();
    try {
        const result = await sql`SELECT * FROM Users WHERE email = ${email}`;
        if (result.length > 0) {
            const user = result[0];
            const isMatch = await comparePassword(password, user.password);
            if (isMatch) {
                return { success: true, user };
            }
        }
        return { success: false, message: "Invalid email or password" };
    } catch (error) {
        console.error("Error checking login:", error);
    }
}

export async function deleteUserById(id) {
    const sql = getPool();
    try {
        const result = await sql`DELETE FROM Users WHERE id = ${id}`;
        if (result.count > 0) {
            return { success: true, message: "User deleted successfully" };
        }
        return { success: false, message: "User not found" };
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

export async function userbyemail(email) {
    const sql = getPool();
    try {
        const result = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (result.length > 0) {
            return result[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching user by email:", error);
    }
}