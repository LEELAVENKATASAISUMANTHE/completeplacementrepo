import { getPool } from "./setup.db.js";
const setupQueries = [
    // 1. DROP EXISTING TABLES (for a clean slate during development)
    `
    DROP TABLE IF EXISTS rolepermissions CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS permissions CASCADE;
    DROP TABLE IF EXISTS roles CASCADE;
    `,

    // 2. CREATE TABLES
    `
    -- Create Roles table
    CREATE TABLE roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Permissions table
    CREATE TABLE permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Users table
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255), -- Can be NULL for OAuth users
        role_id INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
    );

    -- Create RolePermissions junction table
    CREATE TABLE rolepermissions (
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (role_id, permission_id),
        CONSTRAINT fk_rolepermissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_rolepermissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
    `,

    // 3. CREATE INDEXES FOR PERFORMANCE
    `
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_role_id ON users(role_id);
    CREATE INDEX idx_users_active ON users(is_active);
    CREATE INDEX idx_roles_name ON roles(name);
    CREATE INDEX idx_roles_active ON roles(is_active);
    CREATE INDEX idx_permissions_name ON permissions(name);
    CREATE INDEX idx_rolepermissions_role_id ON rolepermissions(role_id);
    CREATE INDEX idx_rolepermissions_permission_id ON rolepermissions(permission_id);
    CREATE INDEX idx_users_role_active ON users(role_id, is_active);
    CREATE INDEX idx_roles_name_active ON roles(name, is_active);
    `,

    // 4. CREATE TRIGGER FUNCTION AND TRIGGERS FOR 'updated_at'
    `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
       NEW.updated_at = CURRENT_TIMESTAMP;
       RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_roles_updated_at
        BEFORE UPDATE ON roles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_permissions_updated_at
        BEFORE UPDATE ON permissions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,

    // 5. INSERT DEFAULT DATA
    `
    -- Insert default roles
    INSERT INTO roles (name, description, is_active) VALUES
        ('Super Admin', 'Full system access with all permissions', true),
        ('Admin', 'Administrative access to most features', true),
        ('Manager', 'Management level access', true),
        ('User', 'Basic user access', true),
        ('Guest', 'Limited read-only access', true);

    -- Insert default permissions
    INSERT INTO permissions (name, description) VALUES
        ('user.create', 'Create new users'),
        ('user.read', 'View user information'),
        ('user.update', 'Update user information'),
        ('user.delete', 'Delete users'),
        ('role.create', 'Create new roles'),
        ('role.read', 'View roles'),
        ('role.update', 'Update roles'),
        ('role.delete', 'Delete roles'),
        ('permission.create', 'Create new permissions'),
        ('permission.read', 'View permissions'),
        ('permission.update', 'Update permissions'),
        ('permission.delete', 'Delete permissions'),
        ('role.assign', 'Assign roles to users'),
        ('permission.assign', 'Assign permissions to roles'),
        ('system.admin', 'Full system administration'),
        ('reports.view', 'View reports and analytics');
    `,

    // 6. ASSIGN PERMISSIONS TO ROLES
    `
    -- Assign all permissions to Super Admin (role_id = 1)
    INSERT INTO rolepermissions (role_id, permission_id)
    SELECT 1, id FROM permissions;

    -- Assign basic permissions to User role (role_id = 4)
    INSERT INTO rolepermissions (role_id, permission_id)
    SELECT 4, id FROM permissions WHERE name IN ('user.read', 'role.read', 'permission.read');
    `,

    // 7. CREATE VIEWS
    `
    CREATE VIEW users_with_roles AS
    SELECT
        u.id, u.name, u.email, u.is_active as user_active, u.created_at as user_created_at,
        r.id as role_id, r.name as role_name, r.description as role_description, r.is_active as role_active
    FROM users u
    JOIN roles r ON u.role_id = r.id;

    CREATE VIEW role_permissions_detailed AS
    SELECT
        rp.role_id, r.name as role_name,
        rp.permission_id, p.name as permission_name, p.description as permission_description,
        rp.created_at
    FROM rolepermissions rp
    JOIN roles r ON rp.role_id = r.id
    JOIN permissions p ON rp.permission_id = p.id;
    `,

    // 8. ADD CHECK CONSTRAINTS
    `
    ALTER TABLE users ADD CONSTRAINT check_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

    ALTER TABLE users ADD CONSTRAINT check_name_not_empty
        CHECK (length(trim(name)) > 0);

    ALTER TABLE roles ADD CONSTRAINT check_role_name_not_empty
        CHECK (length(trim(name)) > 0);

    ALTER TABLE permissions ADD CONSTRAINT check_permission_name_not_empty
        CHECK (length(trim(name)) > 0);
    `,

    // 9. CREATE FUNCTIONS
    `
    CREATE OR REPLACE FUNCTION user_has_permission(p_user_id INTEGER, p_permission_name VARCHAR)
    RETURNS BOOLEAN AS $$
    DECLARE
        has_perm BOOLEAN := FALSE;
    BEGIN
        SELECT EXISTS(
            SELECT 1
            FROM users u
            JOIN rolepermissions rp ON u.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = p_user_id
              AND p.name = p_permission_name
              AND u.is_active = true
        ) INTO has_perm;
        RETURN has_perm;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id INTEGER)
    RETURNS TABLE(permission_name VARCHAR, permission_description TEXT) AS $$
    BEGIN
        RETURN QUERY
        SELECT p.name, p.description
        FROM users u
        JOIN rolepermissions rp ON u.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = p_user_id
          AND u.is_active = true
        ORDER BY p.name;
    END;
    $$ LANGUAGE plpgsql;
    `,
];


// --- MAIN EXECUTION FUNCTION ---
/**
 * Executes all database setup queries in a single transaction.
 */
export const setupDatabase = async () => {
    const sql = getPool();
    
    console.log('Connected to database. Starting setup...');

    try {
        await sql.begin(async sql => {
            for (const query of setupQueries) {
                await sql.unsafe(query);
            }
        });
        console.log('✅ Database setup completed successfully!');
    } catch (error) {
        console.error('❌ Error during database setup. Transaction was automatically rolled back.');
        console.error(error);
        throw error; // Re-throw the error for the calling process
    } 
};

// To make the script runnable directly, you can add this block.
// This allows you to run `node db_setup.js` from your terminal.
if (import.meta.url === `file://${process.argv[1]}`) {
    setupDatabase()
        .then(() => {
            console.log('Script finished.');
            const sql = getPool();
            sql.end(); // Close the connection
        })
        .catch(() => {
            console.error('Script finished with errors.');
            process.exit(1);
        });
}
