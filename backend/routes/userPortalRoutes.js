const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  getMyProfile,
  upsertMyProfile,
  getUserJobs,
  getJobApplicationForm,
  applyToJob,
  getMyApplications,
  getMyHomeData,
  getMyNotifications,
  getMyInterviews,
  getMyAssessments,
  submitAssessmentQuiz
} = require('../controllers/userPortalController');

router.use(authenticate);

router.get('/home', getMyHomeData);
router.get('/profile', getMyProfile);
router.put('/profile', upsertMyProfile);
router.get('/jobs', getUserJobs);
router.get('/jobs/:jobId/application-form', getJobApplicationForm);
router.post('/jobs/:jobId/apply', applyToJob);
router.get('/applications', getMyApplications);
router.get('/notifications', getMyNotifications);
router.get('/interviews', getMyInterviews);
router.get('/assessments', getMyAssessments);
router.post('/assessments/:applicationId/submit', submitAssessmentQuiz);

module.exports = router;
