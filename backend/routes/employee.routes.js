const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private/HR
router.get('/', protect, authorize('HR'), async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId', 'email')
      .populate('onboardingSubmissionId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees'
    });
  }
});

// @route   GET /api/employees/active
// @desc    Get all active employees (for welcome emails and dashboard)
// @access  Private
router.get('/active', protect, async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
      .select('employeeId email fullName department phone isActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      employees
    });
  } catch (error) {
    console.error('Error fetching active employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active employees'
    });
  }
});

// @route   GET /api/employees/:employeeId/document/:documentType
// @desc    Get employee document
// @access  Private/HR/Employee
router.get('/:employeeId/document/:documentType', protect, async (req, res) => {
  try {
    const { employeeId, documentType } = req.params;
    
    const employee = await Employee.findOne({ employeeId });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check authorization: only HR or the employee themselves can access documents
    if (req.user.role !== 'HR' && req.user.email !== employee.email) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to documents'
      });
    }

    const document = employee.documents?.[documentType];

    if (!document || !document.data) {
      return res.status(404).json({
        success: false,
        message: `Document ${documentType} not found`
      });
    }

    // Set appropriate headers and send the document
    res.set('Content-Type', document.contentType);
    res.set('Content-Disposition', `inline; filename="${document.filename}"`);
    res.send(document.data);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document'
    });
  }
});

// @route   GET /api/employees/:employeeId/documents
// @desc    Get all documents metadata for an employee (without actual file data)
// @access  Private/HR/Employee
router.get('/:employeeId/documents', protect, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employee = await Employee.findOne({ employeeId }, {
      'documents.tenthCertificate.filename': 1,
      'documents.tenthCertificate.contentType': 1,
      'documents.tenthCertificate.uploadedAt': 1,
      'documents.intermediateCertificate.filename': 1,
      'documents.intermediateCertificate.contentType': 1,
      'documents.intermediateCertificate.uploadedAt': 1,
      'documents.degreeCertificate.filename': 1,
      'documents.degreeCertificate.contentType': 1,
      'documents.degreeCertificate.uploadedAt': 1,
      'documents.additionalCertificates.filename': 1,
      'documents.additionalCertificates.contentType': 1,
      'documents.additionalCertificates.uploadedAt': 1,
      'documents.experienceLetters.filename': 1,
      'documents.experienceLetters.contentType': 1,
      'documents.experienceLetters.uploadedAt': 1,
      'documents.aadhaarDocument.filename': 1,
      'documents.aadhaarDocument.contentType': 1,
      'documents.aadhaarDocument.uploadedAt': 1,
      'documents.panDocument.filename': 1,
      'documents.panDocument.contentType': 1,
      'documents.panDocument.uploadedAt': 1,
      'documents.addressProof.filename': 1,
      'documents.addressProof.contentType': 1,
      'documents.addressProof.uploadedAt': 1,
      'documents.profilePhoto.filename': 1,
      'documents.profilePhoto.contentType': 1,
      'documents.profilePhoto.uploadedAt': 1,
      'documents.semester1_1.filename': 1,
      'documents.semester1_1.contentType': 1,
      'documents.semester1_1.uploadedAt': 1,
      'documents.semester1_2.filename': 1,
      'documents.semester1_2.contentType': 1,
      'documents.semester1_2.uploadedAt': 1,
      'documents.semester2_1.filename': 1,
      'documents.semester2_1.contentType': 1,
      'documents.semester2_1.uploadedAt': 1,
      'documents.semester2_2.filename': 1,
      'documents.semester2_2.contentType': 1,
      'documents.semester2_2.uploadedAt': 1,
      'documents.semester3_1.filename': 1,
      'documents.semester3_1.contentType': 1,
      'documents.semester3_1.uploadedAt': 1,
      'documents.semester3_2.filename': 1,
      'documents.semester3_2.contentType': 1,
      'documents.semester3_2.uploadedAt': 1,
      'documents.semester4_1.filename': 1,
      'documents.semester4_1.contentType': 1,
      'documents.semester4_1.uploadedAt': 1,
      'documents.semester4_2.filename': 1,
      'documents.semester4_2.contentType': 1,
      'documents.semester4_2.uploadedAt': 1,
      'documents.provisionalCertificate.filename': 1,
      'documents.provisionalCertificate.contentType': 1,
      'documents.provisionalCertificate.uploadedAt': 1
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'HR' && req.user.email !== employee.email) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to documents'
      });
    }

    res.json({
      success: true,
      documents: employee.documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents'
    });
  }
});

// @route   DELETE /api/employees/cleanup/all
// @desc    Delete all employees (for cleanup/testing)
// @access  Private/Admin
router.delete('/cleanup/all', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const result = await Employee.deleteMany({});
    
    res.json({
      success: true,
      message: 'All employees deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employees'
    });
  }
});

module.exports = router;
