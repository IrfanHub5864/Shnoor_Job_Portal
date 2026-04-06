const User = require('../models/User');
const Job = require('../models/Job');
const ManagerTestLink = require('../models/ManagerTestLink');
const ActivityLog = require('../models/ActivityLog');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...safeUser } = user;
    return res.status(200).json({
      message: 'Manager profile fetched successfully',
      data: safeUser
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching manager profile', error: error.message });
  }
};

const getManagerUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    return res.status(200).json({
      message: 'Users fetched successfully',
      data: users
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const updateUserBlockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot block or unblock your own account' });
    }

    const updatedUser = await User.updateBlockStatus(id, Boolean(isBlocked));
    await ActivityLog.record(
      Boolean(isBlocked) ? 'Manager Blocked User' : 'Manager Unblocked User',
      'user',
      id
    );

    const { password, ...safeUser } = updatedUser;
    return res.status(200).json({
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: safeUser
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user block status', error: error.message });
  }
};

const getManagerJobs = async (req, res) => {
  try {
    const jobs = await Job.getAll();
    return res.status(200).json({
      message: 'Jobs fetched successfully',
      data: jobs
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedJob = await Job.updateStatus(id, status);
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await ActivityLog.record('Manager Updated Job Status', 'job', id);

    return res.status(200).json({
      message: 'Job status updated successfully',
      data: updatedJob
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating job status', error: error.message });
  }
};

const getTestLinks = async (req, res) => {
  try {
    const testLinks = await ManagerTestLink.getAll();
    return res.status(200).json({
      message: 'Test links fetched successfully',
      data: testLinks
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching test links', error: error.message });
  }
};

const createTestLink = async (req, res) => {
  try {
    const { linkUrl, linkStatus } = req.body;

    if (!linkUrl) {
      return res.status(400).json({ message: 'linkUrl is required' });
    }

    if (linkStatus && !['pending', 'sent', 'completed', 'expired'].includes(linkStatus)) {
      return res.status(400).json({ message: 'Invalid link status' });
    }

    const testLink = await ManagerTestLink.create(req.body, req.user.id);
    await ActivityLog.record('Manager Created Test Link', 'manager_test_link', testLink.id);

    return res.status(201).json({
      message: 'Test link created successfully',
      data: testLink
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating test link', error: error.message });
  }
};

const updateTestLink = async (req, res) => {
  try {
    const { id } = req.params;
    const current = await ManagerTestLink.getById(id);

    if (!current) {
      return res.status(404).json({ message: 'Test link not found' });
    }

    if (req.body.linkStatus && !['pending', 'sent', 'completed', 'expired'].includes(req.body.linkStatus)) {
      return res.status(400).json({ message: 'Invalid link status' });
    }

    const updated = await ManagerTestLink.update(id, req.body, req.user.id);
    await ManagerTestLink.createUpdateLog(id, current, updated, req.user.id);
    await ActivityLog.record('Manager Updated Test Link', 'manager_test_link', id);

    return res.status(200).json({
      message: 'Test link updated successfully',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating test link', error: error.message });
  }
};

const getTestLinkUpdates = async (req, res) => {
  try {
    const updates = await ManagerTestLink.getUpdates();
    return res.status(200).json({
      message: 'Test link updates fetched successfully',
      data: updates
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching test link updates', error: error.message });
  }
};

module.exports = {
  getProfile,
  getManagerUsers,
  updateUserBlockStatus,
  getManagerJobs,
  updateJobStatus,
  getTestLinks,
  createTestLink,
  updateTestLink,
  getTestLinkUpdates
};
