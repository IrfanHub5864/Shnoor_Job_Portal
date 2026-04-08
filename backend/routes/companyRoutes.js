const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  createCompany,
  getCompanyById,
  getCompanyDetails,
  updateCompanyStatus,
  approveCompany,
  rejectCompany,
  blockCompany
} = require('../controllers/companyController');
const { authenticateAdmin, authenticateRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateRoles('admin', 'superadmin', 'manager', 'company_manager'), getAllCompanies);
router.post('/', authenticateAdmin, createCompany);
router.get('/:id/details', authenticateRoles('admin', 'superadmin', 'manager', 'company_manager'), getCompanyDetails);
router.get('/:id', authenticateRoles('admin', 'superadmin', 'manager', 'company_manager'), getCompanyById);
router.put('/:id/status', authenticateAdmin, updateCompanyStatus);
router.put('/:id/approve', authenticateAdmin, approveCompany);
router.put('/:id/reject', authenticateAdmin, rejectCompany);
router.put('/:id/block', authenticateAdmin, blockCompany);

module.exports = router;
