const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.status(200).json({
      message: 'Users fetched successfully',
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      message: 'User fetched successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Block User
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToBlock = await User.findById(id);
    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (['superadmin', 'admin'].includes(String(userToBlock.role || '').toLowerCase())) {
      return res.status(400).json({ message: 'Super admin cannot be blocked' });
    }

    const updatedUser = await User.updateBlockStatus(id, true);
    await ActivityLog.record('Blocked User', 'user', id);
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.status(200).json({
      message: 'User blocked successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
};

// Unblock User
const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.updateBlockStatus(id, false);
    await ActivityLog.record('Unblocked User', 'user', id);
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.status(200).json({
      message: 'User unblocked successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser
};
