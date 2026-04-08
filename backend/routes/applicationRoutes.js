const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.use(authenticateAdmin);

router.get('/', getAllApplications);
router.put('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteApplication);

module.exports = router;
