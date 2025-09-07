import { getPool } from "../db/setup.db.js";
import { comparePassword } from "../utils/hash.js";
import dotenv from 'dotenv';

dotenv.config();

async function verifySuperUser() {
    const pool = getPool();
    
    try {
        console.log("🔍 Verifying superuser login...");
        
        // Get the user
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', ['sumanth@superadmin.com']);
        const user = userRes.rows;
        if (user.length === 0) {
            console.log('❌ User not found!');
            return;
        }
        
        // Verify password
        const isPasswordValid = await comparePassword("Mythri@14", user[0].password);
        
        if (isPasswordValid) {
            console.log("✅ Password verification successful!");
            console.log("\n📋 User Details:");
            console.log("ID:", user[0].id);
            console.log("Name:", user[0].name);
            console.log("Email:", user[0].email);
            console.log("Role ID:", user[0].role_id);
            console.log("Active:", user[0].is_active);
            
            // Check role details
            const roleRes = await pool.query('SELECT * FROM roles WHERE id = $1', [user[0].role_id]);
            const role = roleRes.rows;
            if (role.length > 0) {
                console.log('\n🎭 Role Details:');
                console.log('Role Name:', role[0].name);
                console.log('Description:', role[0].description);
                console.log('Role Active:', role[0].is_active);
            }
            
            console.log("\n🎉 Superuser is ready to use!");
            console.log("You can now login with:");
            console.log("Email: sumanth@superadmin.com");
            console.log("Password: Mythri@14");
            
        } else {
            console.log("❌ Password verification failed!");
        }
        
    } catch (error) {
        console.error("❌ Error verifying superuser:", error);
    } finally {
        const poolRef = getPool();
        await poolRef.end();
        console.log('\nDatabase pool closed.');
    }
}

// Run the verification
verifySuperUser()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Verification failed:", error);
        process.exit(1);
    });
