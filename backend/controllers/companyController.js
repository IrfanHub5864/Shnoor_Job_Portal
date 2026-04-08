const Company = require('../models/Company');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// Get All Companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.getAll();
    res.status(200).json({
      message: 'Companies fetched successfully',
      data: companies
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
};

// Create Company
const createCompany = async (req, res) => {
  try {
    const { name, owner_id, email, phone, website, description } = req.body;

    if (!name || !owner_id || !email) {
      return res.status(400).json({ message: 'name, owner_id, and email are required' });
    }

    const owner = await User.findById(owner_id);
    if (!owner) {
      return res.status(404).json({ message: 'Owner user not found' });
    }

    const createdCompany = await Company.create(name, owner_id, email, phone, website, description);
    await ActivityLog.record('Created Company', 'company', createdCompany.id);

    res.status(201).json({
      message: 'Company created successfully',
      data: createdCompany
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
};

// Get Company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.getById(id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      message: 'Company fetched successfully',
      data: company
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company', error: error.message });
  }
};

// Get Company Details
const getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await Company.getDetailById(id);

    if (!details) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      message: 'Company details fetched successfully',
      data: details
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company details', error: error.message });
  }
};

// Update Company Status
const updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedCompany = await Company.updateStatus(id, status);
    await ActivityLog.record(
      status === 'approved' ? 'Approved Company' : status === 'rejected' ? 'Rejected Company' : 'Updated Company Status',
      'company',
      id
    );
    res.status(200).json({
      message: 'Company status updated successfully',
      data: updatedCompany
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating company status', error: error.message });
  }
};

// Approve Company
const approveCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCompany = await Company.updateStatus(id, 'approved');
    await ActivityLog.record('Approved Company', 'company', id);
    res.status(200).json({
      message: 'Company approved successfully',
      data: updatedCompany
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving company', error: error.message });
  }
};

// Reject Company
const rejectCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCompany = await Company.updateStatus(id, 'rejected');
    await ActivityLog.record('Rejected Company', 'company', id);
    res.status(200).json({
      message: 'Company rejected successfully',
      data: updatedCompany
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting company', error: error.message });
  }
};

// Block Company
const blockCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCompany = await Company.updateStatus(id, 'blocked');
    await ActivityLog.record('Blocked Company', 'company', id);
    res.status(200).json({
      message: 'Company blocked successfully',
      data: updatedCompany
    });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking company', error: error.message });
  }
};

module.exports = {
  getAllCompanies,
  createCompany,
  getCompanyById,
  getCompanyDetails,
  updateCompanyStatus,
  approveCompany,
  rejectCompany,
  blockCompany
};
