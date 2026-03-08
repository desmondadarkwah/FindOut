const express = require('express');
const router = express.Router();
const {
  AdminLogin,
  AdminLogout,
  GetCurrentAdmin,
  GetDashboardStats,
  GetAllUsers,
  VerifyUser,
  UnverifyUser,
  DeleteUser,
  PromoteToAdmin,
  GetAllPosts,
  DeletePostAdmin
} = require('../controllers/adminController');
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');

// ═══════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════
router.post('/login', AdminLogin);
router.post('/logout', adminAuth, AdminLogout);
router.get('/me', adminAuth, GetCurrentAdmin);

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
router.get('/dashboard/stats', adminAuth, GetDashboardStats);

// ═══════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════
router.get('/users', adminAuth, GetAllUsers);
router.patch('/users/:userId/verify', adminAuth, VerifyUser);
router.patch('/users/:userId/unverify', adminAuth, UnverifyUser);
router.delete('/users/:userId', adminAuth, DeleteUser);
router.post('/users/:userId/promote', adminAuth, superAdminAuth, PromoteToAdmin);

// ═══════════════════════════════════════════════════════════════
// POST MANAGEMENT
// ═══════════════════════════════════════════════════════════════
router.get('/posts', adminAuth, GetAllPosts);
router.delete('/posts/:postId', adminAuth, DeletePostAdmin);

module.exports = router;