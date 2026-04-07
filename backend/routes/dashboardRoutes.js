const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getDashboardCharts
} = require('../controllers/dashboardController');
const { authenticateSuperAdmin } = require('../middleware/authMiddleware');

router.use(authenticateSuperAdmin);

router.get('/stats', getDashboardStats);
router.get('/charts', getDashboardCharts);

module.exports = router;
