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
            // Sanitize user object before saving to session
            const { password: _pwd, ...safeUser } = result.user;
            req.session.user = safeUser;

            // Ensure the session is persisted to the store before querying it back
            await new Promise((resolve, reject) => {
                req.session.save((err) => (err ? reject(err) : resolve()));
            });

            const sid = req.sessionID || req.session.id; // express-session exposes the sid here
            let insertedSession = null;
            try {
                const sessionResult = await pool.query(
                    'SELECT sid FROM user_sessions WHERE sid = $1',
                    [sid]
                );
                insertedSession = sessionResult.rows[0] || null;
            } catch (e) {
                console.error('Error fetching inserted session by sid:', e);
            }

            const payload = { ...safeUser, session: insertedSession };
            console.log('User logged in:', { userId: safeUser.id, sid });
            return res.status(200).json({ route: req.originalUrl, success: true, user: payload });
        }
        return res.status(401).json({ route: req.originalUrl, success: false, message: "Invalid email or password" });
    } catch (error) {
        return res.status(500).json({ route: req.originalUrl, success: false,message: `Internal server error ${error.message}` });
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
