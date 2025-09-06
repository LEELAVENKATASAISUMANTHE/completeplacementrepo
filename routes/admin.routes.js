import { registerUser, loginUser, fetchUsers, getUserByEmail, getUserData } from "../controller/user.controller.js";
import { oauthConsent, oauthCallback, logout, getUserData as getOAuthUserData } from "../controller/oauth.js";
import { createRole, fetchRoleById, fetchRoleByName, fetchRoles, modifyRole, removeRole } from "../controller/role.controller.js";
import { insertPrermission, fetchPermissions, removePermission, getPermissionId } from "../controller/permission.controller.js";
import { assignPermission, removePermissions, fetchAllRolePermissions, fetchAllPermissionsByRoleId, fetchAllRolesByPermissionId } from "../controller/rolepermission.controller.js";
import { Router } from "express";

// Import middleware
import { 
  requireAuth, 
  requirePermission, 
  requireRole, 
  requireAdmin, 
  requireSelfOrAdmin 
} from "../middleware/routeaccess.miidle.js";

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
router.get("/userdata", requireAuth, getOAuthUserData);
router.get("/userbyemail", requireAuth, requirePermission('user.read'), getUserByEmail);

// === USER MANAGEMENT ROUTES ===
// Get all users (admin only)
router.get("/users", requireAuth, requirePermission('user.read'), adminLimiter, fetchUsers);

// === ROLE MANAGEMENT ROUTES ===
// View roles
router.get("/roles", requireAuth, requirePermission('role.read'), fetchRoles);
router.get("/roles/id/:id", requireAuth, requirePermission('role.read'), fetchRoleById);
router.get("/roles/name/:name", requireAuth, requirePermission('role.read'), fetchRoleByName);

// Manage roles (admin only)
router.post("/roles", requireAuth, requirePermission('role.create'), adminLimiter, createRole);
router.put("/roles/:id", requireAuth, requirePermission('role.update'), adminLimiter, modifyRole);
router.delete("/roles/:id", requireAuth, requirePermission('role.delete'), adminLimiter, removeRole);

// === PERMISSION MANAGEMENT ROUTES ===
// View permissions
router.get("/permissions", requireAuth, requirePermission('permission.read'), fetchPermissions);
router.get("/permissions/id/:id", requireAuth, requirePermission('permission.read'), getPermissionId);

// Manage permissions (admin only)
router.post("/permissions", requireAuth, requirePermission('permission.create'), adminLimiter, insertPrermission);
router.delete("/permissions/:id", requireAuth, requirePermission('permission.delete'), adminLimiter, removePermission);

// === ROLE-PERMISSION MANAGEMENT ROUTES ===
// View role-permission mappings
router.get("/rolepermissions", requireAuth, requirePermission('permission.read'), fetchAllRolePermissions);
router.get("/rolepermissions/role/:roleId", requireAuth, requirePermission('permission.read'), fetchAllPermissionsByRoleId);
router.get("/rolepermissions/permission/:permissionId", requireAuth, requirePermission('permission.read'), fetchAllRolesByPermissionId);

// Manage role-permission assignments (admin only)
router.post("/rolepermissions", requireAuth, requirePermission('permission.assign'), adminLimiter, assignPermission);
router.delete("/rolepermissions", requireAuth, requirePermission('permission.assign'), adminLimiter, removePermissions);

export default router;