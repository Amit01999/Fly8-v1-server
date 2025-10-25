const jwt = require('jsonwebtoken');
require('dotenv').config();
const Admin = require('../models/Admin');

// General authentication middleware
exports.auth = async (req, res, next) => {
  try {
    console.log('Auth middleware activated');
    // Prioritize Authorization header
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // Fallback to cookie or body (optional, but keep for flexibility)
    if (!token) {
      token = req.cookies.token || req.body.token;
    }

    console.log('Extracted token:', token ? 'Found' : 'Not found');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is missing',
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decode);
      req.user = decode;
      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Something went wrong while validating the token',
    });
  }
};

// Admin-only authentication middleware
exports.isAdmin = async (req, res, next) => {
  try {
    console.log('Admin auth middleware activated');

    // Check if user object exists (set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Check if user has admin role
    if (req.user.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Optionally, fetch full admin details from database
    const admin = await Admin.findById(req.user.id);
    if (!admin || !admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive or does not exist',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error verifying admin status',
    });
  }
};

// Permission check middleware factory
exports.hasPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.admin) {
        return res.status(403).json({
          success: false,
          message: 'Admin authentication required',
        });
      }

      // Super admin has all permissions
      if (req.admin.role === 'super-admin') {
        return next();
      }

      // Check specific permission
      const hasPermission = req.admin.permissions?.[resource]?.[action];
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${action} ${resource}`,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
      });
    }
  };
};
