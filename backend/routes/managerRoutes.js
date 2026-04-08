const express = require('express');
const {
  getProfile,
  updateProfile,
  getManagerUsers,
  updateUserBlockStatus,
  getManagerJobs,
  createManagerJob,
  updateJobStatus,
  getManagerApplications,
  updateManagerApplicationStatus,
  shortlistAndSendTestLink,
  atsShortlistApplications,
  getTestLinks,
  createTestLink,
  updateTestLink,
  callCandidateForInterviewFromTest,
  getTestLinkUpdates,
  getInterviews,
  createInterview,
  updateInterviewStatus,
  getInterviewUpdates,
  getOffboardingLetters,
  sendOffboardingLetter,
  getManagerStats,
  getRecentUpdates
} = require('../controllers/managerController');
const { authenticateRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateRoles('manager', 'company_manager', 'admin', 'superadmin'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/users', getManagerUsers);
router.put('/users/:id/block-status', updateUserBlockStatus);

router.get('/jobs', getManagerJobs);
router.post('/jobs', createManagerJob);
router.put('/jobs/:id/status', updateJobStatus);
router.get('/applications', getManagerApplications);
router.put('/applications/:id/status', updateManagerApplicationStatus);
router.post('/applications/:id/shortlist-test', shortlistAndSendTestLink);
router.post('/jobs/:id/ats-shortlist', atsShortlistApplications);

router.get('/test-links', getTestLinks);
router.post('/test-links', createTestLink);
router.put('/test-links/:id', updateTestLink);
router.post('/test-links/:id/call-interview', callCandidateForInterviewFromTest);
router.get('/test-link-updates', getTestLinkUpdates);
router.get('/interviews', getInterviews);
router.post('/interviews', createInterview);
router.put('/interviews/:id/status', updateInterviewStatus);
router.get('/interview-updates', getInterviewUpdates);
router.get('/offboarding-letters', getOffboardingLetters);
router.post('/offboarding-letters', sendOffboardingLetter);
router.get('/stats', getManagerStats);
router.get('/recent-updates', getRecentUpdates);

module.exports = router;
