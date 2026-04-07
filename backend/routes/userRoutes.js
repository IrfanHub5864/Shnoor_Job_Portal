const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser
} = require('../controllers/userController');
const { authenticateSuperAdmin } = require('../middleware/authMiddleware');

router.use(authenticateSuperAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/block', blockUser);
router.put('/:id/unblock', unblockUser);

module.exports = router;
