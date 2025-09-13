/**
 * Route Access Middleware
 * Contains authentication and authorization middleware functions
 */
import { checkUserPermission } from '../db/haspermission.js';

/**
 * Helper functions for common response patterns
 */
const unauthorized = (req, res, msg = 'Authentication required') =>
  res.status(401).json({ 
    success: false, 
    error: { code: 'unauthorized', message: msg }, 
    route: req.originalUrl 
  });

const forbidden = (req, res, msg = 'Forbidden') =>
  res.status(403).json({ 
    success: false, 
    error: { code: 'forbidden', message: msg }, 
    route: req.originalUrl 
  });

const internalErr = (req, res, msg = 'Internal Server Error') =>
  res.status(500).json({ 
    success: false, 
    error: { code: 'internal_error', message: msg }, 
    route: req.originalUrl 
  });

/**
 * Basic authentication check middleware
 * Verifies that user is logged in and has a valid session
 */
export const requireAuth = (req, res, next) => {
  console.log('Session data:', req.session.user);
  if (!req.session?.user) {
    return unauthorized(req, res);
  }
  next();
};

/**
 * Check if user has specific permission
 * @param {string} permissionName - Required permission name
 * @returns {Function} Middleware function
 */
export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    if (!req.session?.user && !req.session?.userId) {
      return unauthorized(req, res);
    }
    
    try {
      const userId = req.session?.user?.id ?? req.session?.userId;
      const hasPermission = await checkUserPermission(userId, permissionName);
      
      if (!hasPermission) {
        return forbidden(req, res, `Access denied. Required permission: ${permissionName}`);
      }
      
      next();
    } catch (error) {
      console.error('requirePermission error:', error?.message || error);
      return internalErr(req, res, 'Permission check failed');
    }
  };
};

/**
 * Check if user has specific role
 * @param {number|string} role - Role ID (number) or role name (string)
 * @returns {Function} Middleware function
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session?.user && !req.session?.userId) {
      return unauthorized(req, res);
    }
    
    try {
      const user = req.session?.user;
      if (!user) {
        return internalErr(req, res, 'User information missing from session');
      }

      if (typeof role === 'number') {
        if (user.role_id !== role) {
          return forbidden(req, res, `Access denied. Required role id: ${role}`);
        }
      } else if (typeof role === 'string') {
        if (user.role_name !== role) {
          return forbidden(req, res, `Access denied. Required role: ${role}`);
        }
      } else {
        return internalErr(req, res, 'Invalid role specified in middleware');
      }
      
      next();
    } catch (error) {
      console.error('requireRole error:', error?.message || error);
      return internalErr(req, res);
    }
  };
};

/**
 * Admin only access middleware
 * Requires 'system.admin' permission
 */
export const requireAdmin = async (req, res, next) => {
  if (!req.session?.user && !req.session?.userId) {
    return unauthorized(req, res);
  }
  
  try {
    const userId = req.session?.user?.id ?? req.session?.userId;
    const hasAdminPermission = await checkUserPermission(userId, 'system.admin');
    
    if (!hasAdminPermission) {
      return forbidden(req, res, 'Admin access required');
    }
    
    next();
  } catch (error) {
    console.error('requireAdmin error:', error?.message || error);
    return internalErr(req, res, 'Admin access check failed');
  }
};

/**
 * Self or admin access middleware
 * User can access their own data or admin can access any
 */
export const requireSelfOrAdmin = async (req, res, next) => {
  if (!req.session?.user && !req.session?.userId) {
    return unauthorized(req, res);
  }
  
  const requestedUserId = Number(req.params?.id ?? req.params?.userId);
  const currentUserId = req.session?.user?.id ?? req.session?.userId;

  // Allow self access
  if (requestedUserId === currentUserId) {
    return next();
  }

  // Check admin access
  try {
    const hasAdminPermission = await checkUserPermission(currentUserId, 'system.admin');
    if (!hasAdminPermission) {
      return forbidden(req, res, 'Access denied. You can only access your own data');
    }
    
    next();
  } catch (error) {
    console.error('requireSelfOrAdmin error:', error?.message || error);
    return internalErr(req, res, 'Access check failed');
  }
};