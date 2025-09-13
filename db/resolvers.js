/**
 * GraphQL Resolvers
 * Contains all GraphQL query and mutation resolvers
 */
import { getPool } from "./setup.db.js";
import { getAllCompanies, getCompanyById } from "./company.db.js";
import { getJobById } from "./job.db.js";

const pool = getPool();

/**
 * Helper function to check if value is valid (not null, undefined, empty, or "NULL")
 * @param {any} value - Value to check
 * @returns {boolean} True if value is valid
 */
const isValidValue = (value) => {
  if (value === null || value === undefined) {
    return false;
  }
  
  // Handle different data types
  if (typeof value === 'string') {
    return value !== "NULL" && value !== "" ;
  }
  
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  
  // For other types (boolean, arrays, objects), check if they exist
  return Boolean(value);
};

export const resolvers = {
  // ============================================================================
  // QUERY RESOLVERS (Entry Points)
  // ============================================================================
  Query: {
    // -------------------------------------------------------------------------
    // User Queries
    // -------------------------------------------------------------------------
    

    searchJob:async (parent, args, context, info) => {
      const { by } = args;

      // If no filters are provided, return an empty array
      if (!by || Object.keys(by).length === 0) {
        return [];
      }

      const baseQuery = 'SELECT * FROM jobs';
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic WHERE clause based on provided filters
      if (isValidValue(by.id)) {
        whereClauses.push(`id = $${paramIndex++}`);
        values.push(by.id);
      }

      if (isValidValue(by.title)) {
        whereClauses.push(`title ILIKE $${paramIndex++}`);
        values.push(`%${by.title}%`);
      }

      if (isValidValue(by.company_id)) {
        whereClauses.push(`company_id = $${paramIndex++}`);
        values.push(by.company_id);
      }

      if (isValidValue(by.location)) {
        whereClauses.push(`location ILIKE $${paramIndex++}`);
        values.push(`%${by.location}%`);
      }

      // If no valid criteria were added, return empty
      if (whereClauses.length === 0) {
        return [];
      }

      // Combine the parts into the final query
      const finalQuery = `${baseQuery} WHERE ${whereClauses.join(' AND ')}`;

      try {
        const res = await pool.query(finalQuery, values);
        return res.rows;
      } catch (error) {
        console.error("Failed to search jobs:", error);
        throw new Error('Failed to search jobs');
      }
    },
    /**
     * Search users by various criteria
     * @param {Object} args - Arguments containing search criteria
     * @returns {Array} Array of users matching criteria
     */
    searchUsers: async (parent, args, context, info) => {
      const { by } = args;

      // If no filters are provided, return an empty array
      if (!by || Object.keys(by).length === 0) {
        return [];
      }

      const baseQuery = 'SELECT * FROM users';
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic WHERE clause based on provided filters
      if (isValidValue(by.id)) {
        whereClauses.push(`id = $${paramIndex++}`);
        values.push(by.id);
      }

      if (isValidValue(by.email)) {
        whereClauses.push(`email ILIKE $${paramIndex++}`);
        values.push(`%${by.email}%`);
      }

      if (isValidValue(by.name)) {
        // Using ILIKE for case-insensitive, partial matching
        whereClauses.push(`name ILIKE $${paramIndex++}`);
        values.push(`%${by.name}%`);
      }
      
      if (isValidValue(by.roleId)) {
        whereClauses.push(`role_id = $${paramIndex++}`);
        values.push(by.roleId);
      }
      
      if (isValidValue(by.roleName)) {
        // Join with roles table to search by role name
        whereClauses.push(`role_id IN (SELECT id FROM roles WHERE name ILIKE $${paramIndex++})`);
        values.push(`%${by.roleName}%`);
      }

      // If no valid criteria were added, return empty
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

    /**
     * Search companies by various criteria
     * @param {Object} args - Arguments containing search criteria
     * @returns {Array} Array of companies matching criteria
     */
    searchCompanies: async (parent, args, context, info) => {
      const { by } = args;
      
      if (!by || Object.keys(by).length === 0) {
        return [];
      }
      
      const baseQuery = 'SELECT * FROM companies';
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic WHERE clause based on provided filters
      if (isValidValue(by.id)) {
        whereClauses.push(`id = $${paramIndex++}`);
        values.push(by.id);
      }
      
      if (isValidValue(by.name)) {
        whereClauses.push(`name ILIKE $${paramIndex++}`);
        values.push(`%${by.name}%`);
      }
      
      if (isValidValue(by.email)) {
        whereClauses.push(`email ILIKE $${paramIndex++}`);
        values.push(`%${by.email}%`);
      }
      
      if (isValidValue(by.description)) {
        whereClauses.push(`description ILIKE $${paramIndex++}`);
        values.push(`%${by.description}%`);
      }
      
      if (isValidValue(by.headquarters)) {
        whereClauses.push(`headquarters::text ILIKE $${paramIndex++}`);
        values.push(`%${by.headquarters}%`);
      }
      
      if (whereClauses.length === 0) {
        return [];
      }
      
      const finalQuery = `${baseQuery} WHERE ${whereClauses.join(' AND ')}`;
      
      try {
        const res = await pool.query(finalQuery, values);
        return res.rows;
      } catch (error) {
        console.error("Failed to search companies:", error);
        throw new Error('Failed to search companies');
      }
    },

    /**
     * Get single user by ID
     */
    user: async (_, { id }) => {
      try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error('Failed to fetch user');
      }
    },

    /**
     * Get all users
     */
    users: async () => {
      try {
        const res = await pool.query('SELECT * FROM users');
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch users:", error);
        throw new Error('Failed to fetch users');
      }
    },

    // -------------------------------------------------------------------------
    // Role Queries
    // -------------------------------------------------------------------------

    /**
     * Get single role by ID
     */
    role: async (_, { id }) => {
      try {
        const res = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch role:", error);
        throw new Error('Failed to fetch role');
      }
    },

    /**
     * Get all roles
     */
    roles: async () => {
      try {
        const res = await pool.query('SELECT * FROM roles');
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        throw new Error('Failed to fetch roles');
      }
    },

    // -------------------------------------------------------------------------
    // Permission Queries
    // -------------------------------------------------------------------------

    /**
     * Get single permission by ID
     */
    permission: async (_, { id }) => {
      try {
        const res = await pool.query('SELECT * FROM permissions WHERE id = $1', [id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch permission:", error);
        throw new Error('Failed to fetch permission');
      }
    },

    /**
     * Get all permissions
     */
    permissions: async () => {
      try {
        const res = await pool.query('SELECT * FROM permissions');
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        throw new Error('Failed to fetch permissions');
      }
    },

    // -------------------------------------------------------------------------
    // Session Queries
    // -------------------------------------------------------------------------

    /**
     * Get single session by ID
     */
    session: async (_, { id }) => {
      try {
        const res = await pool.query('SELECT * FROM user_sessions WHERE sid = $1', [id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch session:", error);
        throw new Error('Failed to fetch session');
      }
    },

    /**
     * Get all sessions
     */
    sessions: async () => {
      try {
        const res = await pool.query('SELECT * FROM user_sessions');
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        throw new Error('Failed to fetch sessions');
      }
    },

    // -------------------------------------------------------------------------
    // Company Queries
    // -------------------------------------------------------------------------

    /**
     * Get all companies
     */
    companies: async () => {
      try {
        return await getAllCompanies();
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        throw new Error('Failed to fetch companies');
      }
    },

    /**
     * Get single company by ID
     */
    company: async (_, { id }) => {
      try {
        return await getCompanyById(id);
      } catch (error) {
        console.error("Failed to fetch company:", error);
        throw new Error('Failed to fetch company');
      }
    },

    // -------------------------------------------------------------------------
    // Job Queries
    // -------------------------------------------------------------------------

    /**
     * Get all jobs
     */
    jobs: async () => {
      try {
        const res = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        throw new Error('Failed to fetch jobs');
      }
    },

    /**
     * Get single job by ID
     */
    job: async (_, { id }) => {
      try {
        return await getJobById(id);
      } catch (error) {
        console.error("Failed to fetch job:", error);
        throw new Error('Failed to fetch job');
      }
    }
  },

  // ============================================================================
  // TYPE RESOLVERS (Relationship Resolvers)
  // ============================================================================

  /**
   * User type resolvers
   * Handles relationships for User objects
   */
  User: {
    /**
     * Get the role for a User
     * @param {Object} parentUser - Parent user object
     * @returns {Object} Role object
     */
    role: async (parentUser) => {
      try {
        const res = await pool.query('SELECT * FROM roles WHERE id = $1', [parentUser.role_id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch role for user:", error);
        throw new Error('Failed to fetch role for user');
      }
    },

    /**
     * Get sessions for a User
     * @param {Object} parentUser - Parent user object
     * @returns {Array} Array of session objects
     */
    sessions: async (parentUser) => {
      try {
        const res = await pool.query('SELECT * FROM user_sessions WHERE user_id = $1', [parentUser.id]);
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch sessions for user:", error);
        throw new Error('Failed to fetch sessions for user');
      }
    }
  },

  /**
   * Role type resolvers
   * Handles relationships for Role objects
   */
  Role: {
    /**
     * Get permissions for a Role (Many-to-Many relationship)
     * @param {Object} parentRole - Parent role object
     * @returns {Array} Array of permission objects
     */
    permissions: async (parentRole) => {
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

    /**
     * Get users with a specific Role
     * @param {Object} parentRole - Parent role object
     * @returns {Array} Array of user objects
     */
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

  /**
   * Permission type resolvers
   * Handles relationships for Permission objects
   */
  Permission: {
    /**
     * Get roles that have a specific Permission (Many-to-Many relationship)
     * @param {Object} parentPermission - Parent permission object
     * @returns {Array} Array of role objects
     */
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
  
  /**
   * UserSession type resolvers
   * Handles relationships for UserSession objects
   */
  UserSession: {
    /**
     * Get the parent user for a UserSession
     * @param {Object} parentSession - Parent session object
     * @returns {Object} User object
     */
    user: async (parentSession) => {
      try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [parentSession.user_id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch user for session:", error);
        throw new Error('Failed to fetch user for session');
      }
    }
  },

  /**
   * Company type resolvers
   * Handles relationships for Company objects
   */
  Company: {
    /**
     * Get users associated with a Company
     * @param {Object} parentCompany - Parent company object
     * @returns {Array} Array of user objects
     */
    users: async (parentCompany) => {
      try {
        const res = await pool.query('SELECT * FROM users WHERE company_id = $1', [parentCompany.id]);
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch users for company:", error);
        return []; // Return empty array if no relationship exists
      }
    },

    /**
     * Get jobs associated with a Company
     * @param {Object} parentCompany - Parent company object
     * @returns {Array} Array of job objects
     */
    jobs: async (parentCompany) => {
      try {
        const res = await pool.query('SELECT * FROM jobs WHERE company_id = $1 ORDER BY created_at DESC', [parentCompany.id]);
        return res.rows;
      } catch (error) {
        console.error("Failed to fetch jobs for company:", error);
        return []; // Return empty array if no relationship exists
      }
    }
  },

  /**
   * Job type resolvers
   * Handles relationships for Job objects
   */
  Job: {
    /**
     * Get the company for a Job
     * @param {Object} parentJob - Parent job object
     * @returns {Object} Company object
     */
    company: async (parentJob) => {
      try {
        const res = await pool.query('SELECT * FROM companies WHERE id = $1', [parentJob.company_id]);
        return res.rows[0];
      } catch (error) {
        console.error("Failed to fetch company for job:", error);
        throw new Error('Failed to fetch company for job');
      }
    }
  }
};

