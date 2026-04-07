const Subscription = require('../models/Subscription');
const ActivityLog = require('../models/ActivityLog');

// Get All Subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.getAll();
    res.status(200).json({
      message: 'Subscriptions fetched successfully',
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
};

// Get Subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.getById(id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({
      message: 'Subscription fetched successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription', error: error.message });
  }
};

// Update Subscription Status
const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedSubscription = await Subscription.updateStatus(id, status);

    await ActivityLog.record(
      status === 'active' ? 'Activated Subscription' : 'Deactivated Subscription',
      'subscription',
      id
    );

    res.status(200).json({
      message: 'Subscription status updated successfully',
      data: updatedSubscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subscription status', error: error.message });
  }
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionStatus
};
