const express = require('express');
const router = express.Router();
const { getAllLogs } = require('../controllers/logsController');
const { authenticateSuperAdmin } = require('../middleware/authMiddleware');

router.use(authenticateSuperAdmin);

router.get('/', getAllLogs);

module.exports = router;