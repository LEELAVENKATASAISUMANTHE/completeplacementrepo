import { getPool } from "./setup.db.js";

export async function deleteSession(sid) {
  const pool = getPool();
    try {
        await pool.query('DELETE FROM user_sessions WHERE sid = $1', [sid]);
    } catch (error) {
        console.error("Error deleting session:", error);
    }

}
