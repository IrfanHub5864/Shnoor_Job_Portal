const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  getCompanyDetails,
  updateCompanyStatus,
  approveCompany,
  rejectCompany,
  blockCompany
} = require('../controllers/companyController');
const { authenticateSuperAdmin } = require('../middleware/authMiddleware');

router.use(authenticateSuperAdmin);

router.get('/', getAllCompanies);
router.get('/:id/details', getCompanyDetails);
router.get('/:id', getCompanyById);
router.put('/:id/status', updateCompanyStatus);
router.put('/:id/approve', approveCompany);
router.put('/:id/reject', rejectCompany);
router.put('/:id/block', blockCompany);

module.exports = router;
