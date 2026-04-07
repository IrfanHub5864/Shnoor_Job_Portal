const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  updateJobStatus,
  deleteJob
} = require('../controllers/jobController');
const { authenticateSuperAdmin } = require('../middleware/authMiddleware');

router.use(authenticateSuperAdmin);

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.put('/:id/status', updateJobStatus);
router.delete('/:id', deleteJob);

module.exports = router;
