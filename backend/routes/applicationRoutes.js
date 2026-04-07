const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { authenticateSuperAdmin } = require('../middleware/authMiddleware');

router.use(authenticateSuperAdmin);

router.get('/', getAllApplications);
router.put('/:id/status', updateApplicationStatus);

module.exports = router;
