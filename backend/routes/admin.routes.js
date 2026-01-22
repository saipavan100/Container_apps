const express = require('express');
const router = express.Router();
const OnboardingSubmission = require('../models/OnboardingSubmission.model');
const Employee = require('../models/Employee.model');
const User = require('../models/User.model');
const Candidate = require('../models/Candidate.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const { sendWelcomeEmail, sendOnboardingPassEmail } = require('../utils/emailService');
const { sendAllOnboardingEmails } = require('../utils/onboardingEmails');
const { v4: uuidv4 } = require('uuid');

// @route   GET /api/admin/submissions
// @desc    Get all onboarding submissions (without large document data for fast loading)
// @access  Private/HR
router.get('/submissions', protect, authorize('HR'), async (req, res) => {
  try {
    // Use lean() for faster query performance + exclude document fields
    const submissions = await OnboardingSubmission.find()
      .populate('candidateId')
      .populate('reviewedBy', 'email fullName')
      .select('-tenthCertificate -intermediateCertificate -degreeCertificate -semester1_1 -semester1_2 -semester2_1 -semester2_2 -semester3_1 -semester3_2 -semester4_1 -semester4_2 -provisionalCertificate -additionalCertificates -aadhaarDocument -panDocument -addressProof -profilePhoto -experienceLetters')
      .lean()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions'
    });
  }
});

// @route   GET /api/admin/submissions/:id
// @desc    Get single submission details (optionally with documents)
// @access  Private/HR
router.get('/submissions/:id', protect, authorize('HR'), async (req, res) => {
  try {
    const { includeDocuments } = req.query;
    
    let query = OnboardingSubmission.findById(req.params.id)
      .populate('candidateId')
      .populate('reviewedBy', 'email fullName');

    // If includeDocuments is not specified or false, exclude binary data for faster loading
    if (!includeDocuments || includeDocuments === 'false') {
      query = query.select('-tenthCertificate -intermediateCertificate -degreeCertificate -semester1_1 -semester1_2 -semester2_1 -semester2_2 -semester3_1 -semester3_2 -semester4_1 -semester4_2 -provisionalCertificate -additionalCertificates -aadhaarDocument -panDocument -addressProof -profilePhoto -experienceLetters');
    }
    // If includeDocuments=true, fetch all data including documents

    // Use lean() for faster query performance
    const submission = await query.lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission'
    });
  }
});

// @route   GET /api/admin/submissions/:id/document/:docField
// @desc    Get a specific document from submission (for download)
// @access  Private/HR
router.get('/submissions/:id/document/:docField', protect, authorize('HR'), async (req, res) => {
  try {
    const { id, docField } = req.params;
    
    // List of valid document fields
    const validDocFields = [
      'tenthCertificate', 'intermediateCertificate', 'degreeCertificate',
      'semester1_1', 'semester1_2', 'semester2_1', 'semester2_2',
      'semester3_1', 'semester3_2', 'semester4_1', 'semester4_2',
      'provisionalCertificate', 'aadhaarDocument', 'panDocument',
      'addressProof', 'profilePhoto'
    ];

    // Security: only allow fetching valid document fields
    if (!validDocFields.includes(docField)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document field'
      });
    }

    // Fetch only the specific document field
    const submission = await OnboardingSubmission.findById(id).select(docField);

    if (!submission || !submission[docField] || !submission[docField].data) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const doc = submission[docField];
    
    // Convert base64 to buffer and send as file
    const buffer = Buffer.from(doc.data, 'base64');
    res.setHeader('Content-Type', doc.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename || docField}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document'
    });
  }
});

// @route   POST /api/admin/submissions/:id/approve
// @desc    Approve onboarding submission and send onboarding pass
// @access  Private/HR
router.post('/submissions/:id/approve', protect, authorize('HR'), async (req, res) => {
  try {
    const { remarks, dateOfJoining } = req.body;

    const submission = await OnboardingSubmission.findById(req.params.id)
      .populate('candidateId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.status === 'APPROVED' || submission.status === 'PASS_SENT') {
      return res.status(400).json({
        success: false,
        message: 'Submission already approved'
      });
    }

    // Validate date of joining
    if (!dateOfJoining) {
      return res.status(400).json({
        success: false,
        message: 'Date of Joining is required'
      });
    }

    // Generate onboarding pass token
    const onboardingPassToken = uuidv4();

    // Update submission with pass details
    submission.status = 'PASS_SENT';
    submission.hrRemarks = remarks;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = Date.now();
    submission.onboardingPassToken = onboardingPassToken;
    submission.onboardingPassSentAt = Date.now();
    submission.dateOfJoining = new Date(dateOfJoining);
    await submission.save();

    // Send onboarding pass email
    setImmediate(async () => {
      try {
        await sendOnboardingPassEmail(submission, onboardingPassToken);
        console.log('✅ Onboarding Pass email sent to', submission.email);
      } catch (error) {
        console.error('❌ Error sending onboarding pass email:', error);
      }
    });

    res.json({
      success: true,
      message: 'Onboarding approved. Employee needs to accept onboarding pass to complete the process.',
      submission: {
        id: submission._id,
        status: submission.status,
        fullName: submission.fullName,
        email: submission.email
      }
    });
  } catch (error) {
    console.error('Error approving submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving submission: ' + error.message
    });
  }
});

// @route   POST /api/admin/submissions/:id/reject
// @desc    Reject onboarding submission
// @access  Private/HR
router.post('/submissions/:id/reject', protect, authorize('HR'), async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({
        success: false,
        message: 'Rejection remarks are required'
      });
    }

    const submission = await OnboardingSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.status = 'REJECTED';
    submission.hrRemarks = remarks;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = Date.now();
    await submission.save();

    res.json({
      success: true,
      message: 'Submission rejected',
      submission: {
        id: submission._id,
        status: submission.status,
        remarks: submission.hrRemarks
      }
    });
  } catch (error) {
    console.error('Error rejecting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting submission'
    });
  }
});


router.get('/onboarding-pass-details/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const submission = await OnboardingSubmission.findOne({
      onboardingPassToken: token,
      status: 'PASS_SENT'
    });

    if (!submission) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired onboarding pass'
      });
    }

    res.json({
      success: true,
      submission: {
        firstName: submission.firstName,
        lastName: submission.lastName,
        email: submission.email,
        department: submission.department,
        dateOfJoining: submission.dateOfJoining
      }
    });
  } catch (error) {
    console.error('Error fetching onboarding pass details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching details'
    });
  }
});

// @route   POST /api/admin/accept-onboarding-pass/:token
// @desc    Accept onboarding pass and create employee
// @access  Public
router.post('/accept-onboarding-pass/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const submission = await OnboardingSubmission.findOne({
      onboardingPassToken: token,
      status: 'PASS_SENT'
    }).populate('candidateId');

    if (!submission) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding pass token or already accepted'
      });
    }

    // Generate Employee ID
    const employeeCount = await Employee.countDocuments();
    const employeeId = `WW${String(employeeCount + 1).padStart(5, '0')}`;

    // Generate initial password
    const namePart = submission.fullName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const initialPassword = `${namePart}@WW2025`;

    // Find and update user
    const user = await User.findOne({ email: submission.email });
    if (user) {
      user.employeeId = employeeId;
      user.password = initialPassword; // Will be hashed by pre-save hook
      await user.save();
    }

    // Get candidate
    const candidate = await Candidate.findById(submission.candidateId);

    // Create Employee record with all documents
    const employee = new Employee({
      employeeId,
      userId: user._id,
      onboardingSubmissionId: submission._id,
      firstName: submission.firstName || submission.fullName.split(' ')[0],
      lastName: submission.lastName || submission.fullName.split(' ').slice(1).join(' '),
      middleName: submission.middleName,
      fullName: submission.fullName,
      email: submission.email,
      phone: submission.phone,
      dateOfBirth: submission.dateOfBirth,
      linkedinUrl: submission.linkedinUrl,
      department: submission.department,
      position: candidate?.position || 'Software Engineer',
      joiningDate: submission.dateOfJoining || new Date(), // Set joining date from submission
      profilePhoto: submission.profilePhoto?.data ? submission.profilePhoto : undefined,
      aboutMe: submission.selfDescription || submission.aboutMe,
      isActive: true,
      // Store all documents from submission
      documents: {
        tenthCertificate: submission.tenthCertificate,
        intermediateCertificate: submission.intermediateCertificate,
        degreeCertificate: submission.degreeCertificate,
        additionalCertificates: submission.additionalCertificates || [],
        semester1_1: submission.semester1_1,
        semester1_2: submission.semester1_2,
        semester2_1: submission.semester2_1,
        semester2_2: submission.semester2_2,
        semester3_1: submission.semester3_1,
        semester3_2: submission.semester3_2,
        semester4_1: submission.semester4_1,
        semester4_2: submission.semester4_2,
        provisionalCertificate: submission.provisionalCertificate,
        experienceLetters: submission.experienceLetters || [],
        aadhaarDocument: submission.aadhaarDocument,
        panDocument: submission.panDocument,
        addressProof: submission.addressProof,
        profilePhoto: submission.profilePhoto
      }
    });

    await employee.save();

    // Update submission
    submission.status = 'PASS_ACCEPTED';
    submission.employeeCreated = true;
    submission.employeeId = employeeId;
    submission.onboardingPassAcceptedAt = Date.now();
    await submission.save();

    // Send 5 onboarding emails to new employee after 2 seconds
    console.log(`📧 Scheduling 5 onboarding emails for ${employee.email} in 2 seconds...`);
    console.log(`📧 Environment: NODE_ENV=${process.env.NODE_ENV}, EMAIL_HOST=${process.env.EMAIL_HOST}`);
    
    // Use setImmediate to ensure the response is sent first, then send emails
    setImmediate(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      try {
        console.log(`📧 Starting to send 5 onboarding emails to ${employee.email}`);
        console.log(`📧 Employee object:`, { 
          email: employee.email, 
          fullName: employee.fullName,
          employeeId: employee.employeeId 
        });
        await sendAllOnboardingEmails(employee, 'Your Manager Name');
        console.log('✅ All 5 onboarding emails sent to new employee');
      } catch (error) {
        console.error('❌ Error sending onboarding emails:', error.message);
        console.error('Stack:', error.stack);
      }
    });

    // Get all active employees except the new one
    const activeEmployees = await Employee.find({
      isActive: true,
      _id: { $ne: employee._id }
    }).select('email fullName');

    // Send welcome email to all active employees about new joiner immediately
    if (activeEmployees.length > 0) {
      setImmediate(async () => {
        try {
          await sendWelcomeEmail(employee, activeEmployees);
          console.log('✅ New employee welcome email sent to all active employees');
        } catch (error) {
          console.error('❌ Error sending welcome emails to team:', error);
        }
      });
    }

    res.json({
      success: true,
      message: 'Onboarding pass accepted! Welcome to WinWire. You will receive onboarding emails in 1 minute.',
      employee: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        department: employee.department
      }
    });
  } catch (error) {
    console.error('Error accepting onboarding pass:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting onboarding pass: ' + error.message
    });
  }
});

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/HR
router.get('/dashboard/stats', protect, authorize('HR'), async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const acceptedOffers = await Candidate.countDocuments({ offerStatus: 'ACCEPTED' });
    const pendingSubmissions = await OnboardingSubmission.countDocuments({ status: 'SUBMITTED' });
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ isActive: true });

    res.json({
      success: true,
      stats: {
        totalCandidates,
        acceptedOffers,
        pendingSubmissions,
        totalEmployees,
        activeEmployees
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

module.exports = router;
