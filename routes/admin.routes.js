import { registerUser, loginUser, getUserData } from "../controller/user.controller.js";
import { oauthConsent, oauthCallback, logout } from "../controller/oauth.js";
import { createRole, modifyRole, removeRole } from "../controller/role.controller.js";
import { insertPermission,removePermission} from "../controller/permission.controller.js";
import { assignPermission,removePermissions}from "../controller/rolepermission.controller.js";
import { createCompany,deleteCompany,updateCompany } from "../controller/companies.controller.js";
import { createJobController, updateJobController, deleteJobController } from "../controller/job.controller.js";  
import { upload } from "../utils/multer.js";
import { Router } from "express";

// Import middleware
import { 
  requireAuth, 
  requirePermission, 
  requireRole, 
  requireAdmin, 
  requireSelfOrAdmin 
} from "../middleware/routeaccess.middleware.js";

// Import rate limiters
import { 
  loginLimiter, 
  generalLimiter, 
  authLimiter, 
  adminLimiter 
} from "../utils/limiter.js";

const router = Router();

// Apply general rate limiting to all routes
router.use(generalLimiter);

// === PUBLIC ROUTES (No authentication required) ===
// Authentication routes
router.post("/login", loginLimiter, loginUser);
router.post("/register", authLimiter, registerUser);

// OAuth routes
router.get("/auth/google", authLimiter, oauthConsent);
router.get("/auth/google/callback", authLimiter, oauthCallback);

// === AUTHENTICATED ROUTES ===
// Logout (requires authentication)
router.get("/logout", requireAuth, logout);

// User data endpoints
router.get("/userdata", requireAuth, getUserData);

// === ROLE MANAGEMENT ROUTES ===
// Manage roles (admin only)
router.post("/roles", requireAuth, requirePermission('role.create'), adminLimiter, createRole);
router.put("/roles/:id", requireAuth, requirePermission('role.update'), adminLimiter, modifyRole);
router.delete("/roles/:id", requireAuth, requirePermission('role.delete'), adminLimiter, removeRole);

// === PERMISSION MANAGEMENT ROUTES ===
// Manage permissions (admin only)
router.delete("/permissions/:id", requireAuth, requirePermission('permission.delete'), adminLimiter, removePermission);

// === ROLE-PERMISSION MANAGEMENT ROUTES ===
// Manage role-permission assignments (admin only)
router.post("/rolepermissions", requireAuth, requirePermission('permission.assign'), adminLimiter, assignPermission);
router.delete("/rolepermissions", requireAuth, requirePermission('permission.assign'), adminLimiter, removePermissions);

router.post("/companies", adminLimiter, upload.single('logo'), createCompany);
router.delete("/companies/:id", adminLimiter, deleteCompany);
router.put("/companies/:id", adminLimiter, upload.single('logo'), updateCompany);

router.post("/jobs", adminLimiter, createJobController);
router.put("/jobs/:id", adminLimiter, updateJobController);
router.delete("/jobs/:id",  adminLimiter, deleteJobController);
// === COMMENTED ROUTES ===
// Uncomment these routes as needed and ensure the corresponding controller functions are imported

// User routes
//router.get("/userbyemail", requireAuth, requirePermission('user.read'), getUserByEmail);

// Role routes
//router.get("/roles/name/:name", requireAuth, requirePermission('role.read'), fetchRoleByName);

// Permission routes
//router.get("/permissions", requireAuth, requirePermission('permission.read'), fetchPermissions);
//router.get("/permissions/id/:id", requireAuth, requirePermission('permission.read'), getPermissionId);
//router.post("/permissions", requireAuth, requirePermission('permission.create'), adminLimiter, insertPrermission);

// Role-permission mapping routes
//router.get("/rolepermissions", requireAuth, requirePermission('permission.read'), fetchAllRolePermissions);
//router.get("/rolepermissions/role/:roleId", requireAuth, requirePermission('permission.read'), fetchAllPermissionsByRoleId);
//router.get("/rolepermissions/permission/:permissionId", requireAuth, requirePermission('permission.read'), fetchAllRolesByPermissionId);

export default router;