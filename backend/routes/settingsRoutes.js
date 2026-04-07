const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticateSuperAdmin } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/', authenticateSuperAdmin, updateSettings);

module.exports = router;
