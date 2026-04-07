const express = require('express');
const router = express.Router();
const {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionStatus
} = require('../controllers/subscriptionController');
const { authenticateSuperAdmin } = require('../middleware/authMiddleware');

router.use(authenticateSuperAdmin);

router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.put('/:id/status', updateSubscriptionStatus);

module.exports = router;
