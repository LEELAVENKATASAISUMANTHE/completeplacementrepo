import {createUsers, getUsers,logincheck,userbyemail,deleteUserById} from "../db/user.db.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { hashPassword } from "../utils/hash.js";
import { getPool } from "../db/setup.db.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role_id } = req.body;
    const hashedPassword = await hashPassword(password);
    const result = await createUsers({ name, email, password: hashedPassword, role_id });
    if (result.success) {
        return res.status(201).json({ route: req.originalUrl, success: true, message: "User registered successfully" });
    }
    return res.status(500).json({ route: req.originalUrl, success: false, message: "User registration failed" });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const pool = getPool();
    try {
        const result = await logincheck(email, password);
        if (result.success) {
            const sessionResult = await pool.query('SELECT * FROM user_sessions WHERE user_id = $1', [result.user.id]);
            const sessionData = sessionResult.rows.length > 0 ? sessionResult.rows[0] : null;

            req.session.user = { ...result.user, session: sessionData };
            console.log("User logged in:", req.session.user);
            return res.status(200).json({ route: req.originalUrl, success: true, user: req.session.user });
        }
        return res.status(401).json({ route: req.originalUrl, success: false, message: "Invalid email or password" });
    } catch (error) {
        return res.status(500).json({ route: req.originalUrl, success: false, message: "Internal server error" });
    }
});



export const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await deleteUserById(userId);
        if (result.success) {
            return res.status(200).json({ route: req.originalUrl, success: true, message: "User deleted successfully" });
        }
        return res.status(404).json({ route: req.originalUrl, success: false, message: "User not found" });
    } catch (error) {
        return res.status(500).json({ route: req.originalUrl, success: false, message: "Internal server error" });
    }
});


export const getUserData = asyncHandler(async (req, res) => {
    if (req.session.user) {
        return res.status(200).json({ route: req.originalUrl, success: true, data: req.session.user, error: null });
    }
    return res.status(401).json({ route: req.originalUrl, success: false, message: "User not authenticated" });
});
