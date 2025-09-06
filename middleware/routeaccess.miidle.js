// routeaccess.middleware.js
import { checkUserPermission } from "../db/haspermission.js"; 

// Basic authentication check
export const requireAuth = (req, res, next) => {
  console.log("Checking authentication for route:", req.originalUrl);
  console.log("Session user:", req.session.user);
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required",
      route: req.originalUrl 
    });
  }
  next();
};

// Check if user has specific permission
export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated",
        route: req.originalUrl 
      });
    }
    
    try {
      // Check if user has the required permission
      const hasPermission = await checkUserPermission(req.session.user.role_id, permissionName);
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required permission: ${permissionName}`,
          route: req.originalUrl 
        });
      }
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Permission check failed",
        route: req.originalUrl 
      });
    }
  };
};

// Check if user has specific role
export const requireRole = (roleName) => {
  return async (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated",
        route: req.originalUrl 
      });
    }

    // For now, we'll check role_id, but you might want to fetch role name
    if (req.session.user.role_id !== roleName && typeof roleName === 'number') {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roleName}`,
        route: req.originalUrl 
      });
    }
    next();
  };
};

// Admin only access (Super Admin or Admin roles)
export const requireAdmin = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Not authenticated",
      route: req.originalUrl 
    });
  }

  try {
    // Check for admin permissions
    const hasAdminPermission = await checkUserPermission(req.session.user.role_id, 'system.admin');
    if (!hasAdminPermission) {
      return res.status(403).json({ 
        success: false, 
        message: "Admin access required",
        route: req.originalUrl 
      });
    }
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Admin access check failed",
      route: req.originalUrl 
    });
  }
};

// Self or admin access (user can access their own data or admin can access any)
export const requireSelfOrAdmin = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Not authenticated",
      route: req.originalUrl 
    });
  }

  const requestedUserId = parseInt(req.params.id || req.params.userId);
  const currentUserId = req.session.user.id;

  // Allow if it's the same user
  if (requestedUserId === currentUserId) {
    return next();
  }

  try {
    // Check if user has admin permission
    const hasAdminPermission = await checkUserPermission(req.session.user.role_id, 'system.admin');
    if (!hasAdminPermission) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. You can only access your own data",
        route: req.originalUrl 
      });
    }
    next();
  } catch (error) {
    console.error("Self or admin check error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Access check failed",
      route: req.originalUrl 
    });
  }
};