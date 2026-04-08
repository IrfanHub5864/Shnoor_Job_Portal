const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  deleteUser
} = require('../controllers/userController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.use(authenticateAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/block', blockUser);
router.put('/:id/unblock', unblockUser);
router.delete('/:id', deleteUser);

module.exports = router;
