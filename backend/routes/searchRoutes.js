const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // ✅ Fixed import
const {
  GlobalSearch,
  ExploreGroups,
  GetAllUsers
} = require('../controllers/searchController');

// All routes require authentication
router.use(authMiddleware); // ✅ Now works correctly

// Search routes
router.get('/search', GlobalSearch);
router.get('/explore/groups', ExploreGroups);
router.get('/explore/users', GetAllUsers);

module.exports = router;