const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.getSettings();

    if (!settings) {
      await Settings.initializeSettings();
      settings = await Settings.getSettings();
    }

    res.status(200).json({
      message: 'Settings fetched successfully',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      platform_name,
      logo_url = null,
      company_email,
      company_phone,
      address,
    } = req.body;

    if (!platform_name || !company_email || !company_phone || !address) {
      return res.status(400).json({
        message: 'platform_name, company_email, company_phone, and address are required',
      });
    }

    let updatedSettings = await Settings.updateSettings(
      platform_name,
      logo_url,
      company_email,
      company_phone,
      address
    );

    if (!updatedSettings) {
      await Settings.initializeSettings();
      updatedSettings = await Settings.updateSettings(
        platform_name,
        logo_url,
        company_email,
        company_phone,
        address
      );
    }

    res.status(200).json({
      message: 'Settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
