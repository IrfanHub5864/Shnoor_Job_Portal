const ActivityLog = require('../models/ActivityLog');

const getAllLogs = async (req, res) => {
  try {
    const entityFilter = String(req.query.entityFilter || 'all');
    const logs = await ActivityLog.getAll(entityFilter);
    res.status(200).json({
      message: 'Logs fetched successfully',
      data: logs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};

module.exports = {
  getAllLogs
};