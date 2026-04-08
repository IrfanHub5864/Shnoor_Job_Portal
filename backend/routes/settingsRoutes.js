const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/', authenticateAdmin, updateSettings);

module.exports = router;
