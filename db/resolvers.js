// Assume getPool is correctly configured to return a PostgreSQL pool
import { getPool } from "./setup.db.js";
const pool = getPool();

export const resolvers = {
  // --- RESOLVERS FOR QUERIES (Entry Points) ---
  Query: {
    // --- User Queries ---
    searchUsers: async (parent, args, context, info) => {
      const { by } = args;

      // If no filters are provided, return an empty array.
      if (!by || Object.keys(by).length === 0) {
        return [];
      }

      const baseQuery = 'SELECT * FROM users';
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      // Conditionally add filters to the query
      if (by.id) {
        whereClauses.push(`id = $${paramIndex++}`);
        values.push(by.id);
      }

      if (by.email) {
        whereClauses.push(`email = $${paramIndex++}`);
        values.push(by.email);
      }

      if (by.name) {
        // Using ILIKE for case-insensitive, partial matching
        whereClauses.push(`name ILIKE $${paramIndex++}`);
        values.push(`%${by.name}%`);
      }
      
      if (by.roleId) {
        whereClauses.push(`role_id = $${paramIndex++}`);
        values.push(by.roleId);
      }

      // If no valid criteria were added, return empty.
      if (whereClauses.length === 0) {
        return [];
      }
      
      // Combine the parts into the final query
      const finalQuery = `${baseQuery} WHERE ${whereClauses.join(' AND ')}`;
      
      try {
        const res = await pool.query(finalQuery, values);
        return res.rows;
      } catch (error) {
        console.error("Failed to search users:", error);
        throw new Error('Failed to search users');
      }
    },
    user: async (_, { id }) => {
      try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error('Failed to fetch user');
      }
    },
    users: async () => {
      try {
        const res = await pool.query('SELECT * FROM users');
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch users:", error);
        throw new Error('Failed to fetch users');
      }
    },

    // --- Role Queries ---
    role: async (_, { id }) => {
      try {
        const res = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch role:", error);
        throw new Error('Failed to fetch role');
      }
    },
    roles: async () => {
      try {
        const res = await pool.query('SELECT * FROM roles');
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        throw new Error('Failed to fetch roles');
      }
    },

    // --- Permission Queries ---
    permission: async (_, { id }) => {
      try {
        const res = await pool.query('SELECT * FROM permissions WHERE id = $1', [id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch permission:", error);
        throw new Error('Failed to fetch permission');
      }
    },
    permissions: async () => {
      try {
        const res = await pool.query('SELECT * FROM permissions');
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        throw new Error('Failed to fetch permissions');
      }
    },

    // --- Session Queries ---
    session: async (_, { id }) => {
      try {
        // NOTE: The table name in the image is user_sessions, not usersessions
        const res = await pool.query('SELECT * FROM user_sessions WHERE sid = $1', [id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch session:", error);
        throw new Error('Failed to fetch session');
      }
    },
    sessions: async () => {
      try {
        const res = await pool.query('SELECT * FROM user_sessions');
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        throw new Error('Failed to fetch sessions');
      }
    }
  },

  // --- RESOLVERS FOR RELATIONSHIPS (The "Graph") ---

  User: {
    // How to get the 'role' for a User
    role: async (parentUser) => {
      // The 'parentUser' object contains the user data from the initial query.
      // We use the foreign key 'role_id' from the users table.
      try {
        const res = await pool.query('SELECT * FROM roles WHERE id = $1', [parentUser.role_id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch role for user:", error);
        throw new Error('Failed to fetch role for user');
      }
    },
    // How to get the 'sessions' for a User
    sessions: async (parentUser) => {
      // We need a 'user_id' column in the 'user_sessions' table for this to work.
      try {
        const res = await pool.query('SELECT * FROM user_sessions WHERE user_id = $1', [parentUser.id]);
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch sessions for user:", error);
        throw new Error('Failed to fetch sessions for user');
      }
    }
  },

  Role: {
    // How to get the 'permissions' for a Role (Many-to-Many)
    permissions: async (parentRole) => {
      // We query via the 'rolepermissions' join table.
      try {
        const queryText = `
          SELECT p.* FROM permissions p
          INNER JOIN rolepermissions rp ON p.id = rp.permission_id
          WHERE rp.role_id = $1
        `;
        const res = await pool.query(queryText, [parentRole.id]);
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch permissions for role:", error);
        throw new Error('Failed to fetch permissions for role');
      }
    },
    // How to get all 'users' with a specific Role
    users: async (parentRole) => {
      try {
        const res = await pool.query('SELECT * FROM users WHERE role_id = $1', [parentRole.id]);
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch users for role:", error);
        throw new Error('Failed to fetch users for role');
      }
    }
  },

  Permission: {
    // How to get all 'roles' that have a specific Permission (Many-to-Many)
    roles: async (parentPermission) => {
      try {
        const queryText = `
          SELECT r.* FROM roles r
          INNER JOIN rolepermissions rp ON r.id = rp.role_id
          WHERE rp.permission_id = $1
        `;
        const res = await pool.query(queryText, [parentPermission.id]);
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch roles for permission:", error);
        throw new Error('Failed to fetch roles for permission');
      }
    }
  },
  
  UserSession: {
    // How to get the parent 'user' for a UserSession
    user: async (parentSession) => {
      // This assumes a 'user_id' column exists on the user_sessions table.
      try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [parentSession.user_id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch user for session:", error);
        throw new Error('Failed to fetch user for session');
      }
    }
  }
};

