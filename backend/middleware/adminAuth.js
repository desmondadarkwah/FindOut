const jwt = require('jsonwebtoken');
const AdminModel = require('../models/AdminModel');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminModel.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid admin token'
    });
  }
};

// Middleware to check if super admin
const superAdminAuth = async (req, res, next) => {
  try {
    if (!req.admin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required'
      });
    }
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
};

module.exports = { adminAuth, superAdminAuth };