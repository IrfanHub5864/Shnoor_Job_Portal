const express = require('express');
const {
  getProfile,
  getManagerUsers,
  updateUserBlockStatus,
  getManagerJobs,
  updateJobStatus,
  getTestLinks,
  createTestLink,
  updateTestLink,
  getTestLinkUpdates
} = require('../controllers/managerController');
const { authenticateRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateRoles('manager', 'admin', 'superadmin'));

router.get('/profile', getProfile);
router.get('/users', getManagerUsers);
router.put('/users/:id/block-status', updateUserBlockStatus);

router.get('/jobs', getManagerJobs);
router.put('/jobs/:id/status', updateJobStatus);

router.get('/test-links', getTestLinks);
router.post('/test-links', createTestLink);
router.put('/test-links/:id', updateTestLink);
router.get('/test-link-updates', getTestLinkUpdates);

module.exports = router;
