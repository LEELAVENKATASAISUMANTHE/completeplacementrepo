import { getPool } from "../db/setup.db.js";
import { hashPassword } from "../utils/hash.js";
import dotenv from 'dotenv';

dotenv.config();

async function createSuperUser() {
    const pool = getPool();
    
    try {
        console.log("Starting superuser creation process...");
        
        // Hash the password
        const hashedPassword = await hashPassword("Mythri@14");
        console.log("Password hashed successfully");
        
        // Check if user with ID 1 already exists
    const existingUserRes = await pool.query('SELECT * FROM users WHERE id = $1', [1]);
    const existingUser = existingUserRes.rows;
        
        if (existingUser.length > 0) {
            console.log("User with ID 1 already exists:");
            console.log(existingUser[0]);
            
            // Ask if we should update the existing user
            console.log("Updating existing user with new credentials...");
            
            await pool.query(
                `UPDATE users SET name = $1, email = $2, password = $3, role_id = $4, is_active = $5, updated_at = NOW() WHERE id = $6`,
                ['sumanth', 'sumanth@superadmin.com', hashedPassword, 1, true, 1]
            );
            
            console.log("✅ Superuser updated successfully!");
        } else {
            // Create new superuser
            console.log("Creating new superuser...");
            
            // First, ensure Super Admin role exists
            const superAdminRoleRes = await pool.query('SELECT * FROM roles WHERE id = $1', [1]);
            const superAdminRole = superAdminRoleRes.rows;
            if (superAdminRole.length === 0) {
                console.log("Creating Super Admin role...");
                await pool.query(
                    `INSERT INTO roles (id, name, description, is_active, created_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (id) DO NOTHING`,
                    [1, 'Super Admin', 'Full system access with all permissions', true]
                );
                console.log("Super Admin role created");
            } else {
                console.log("Super Admin role already exists");
            }
            
            // Create the superuser with specific ID
            await pool.query(
                `INSERT INTO users (id, name, email, password, role_id, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [1, 'sumanth', 'sumanth@superadmin.com', hashedPassword, 1, true]
            );
            
            // Reset the sequence to continue from 2 for future users
            await pool.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
            
            console.log("✅ Superuser created successfully!");
        }
        
        // Verify the user was created/updated
    const verifyUserRes = await pool.query('SELECT id, name, email, role_id, is_active, created_at FROM users WHERE id = $1', [1]);
    const verifyUser = verifyUserRes.rows;
        console.log("\n📋 Superuser details:");
        console.log("ID:", verifyUser[0].id);
        console.log("Name:", verifyUser[0].name);
        console.log("Email:", verifyUser[0].email);
        console.log("Role ID:", verifyUser[0].role_id);
        console.log("Active:", verifyUser[0].is_active);
        console.log("Created:", verifyUser[0].created_at);
        
        console.log("\n🔑 Login Credentials:");
        console.log("Email: sumanth@superadmin.com");
        console.log("Password: Mythri@14");
        
    } catch (error) {
        console.error("❌ Error creating superuser:", error);
        throw error;
    } finally {
        // Close the database pool
        const poolRef = getPool();
        await poolRef.end();
        console.log('\nDatabase pool closed.');
    }
}

// Run the script
createSuperUser()
    .then(() => {
        console.log("\n🎉 Superuser creation completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Failed to create superuser:", error);
        process.exit(1);
    });
