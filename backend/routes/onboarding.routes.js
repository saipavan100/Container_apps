const express = require('express');
const router = express.Router();
const OnboardingSubmission = require('../models/OnboardingSubmission.model');
const Candidate = require('../models/Candidate.model');
const { protect } = require('../middleware/auth.middleware');
const { uploadToDatabase, prepareDocumentForDB, prepareDocumentsForDB } = require('../utils/databaseFileUpload');

// @route   POST /api/onboarding/submit
// @desc    Submit onboarding form
// @access  Private/Employee
router.post('/submit', protect, uploadToDatabase.fields([
  // Education certificates
  { name: 'tenthCertificate', maxCount: 1 },
  { name: 'intermediateCertificate', maxCount: 1 },
  { name: 'degreeCertificate', maxCount: 1 },
  { name: 'additionalCertificates', maxCount: 5 },
  // BTech semester certificates
  { name: 'semester1_1', maxCount: 1 },
  { name: 'semester1_2', maxCount: 1 },
  { name: 'semester2_1', maxCount: 1 },
  { name: 'semester2_2', maxCount: 1 },
  { name: 'semester3_1', maxCount: 1 },
  { name: 'semester3_2', maxCount: 1 },
  { name: 'semester4_1', maxCount: 1 },
  { name: 'semester4_2', maxCount: 1 },
  { name: 'provisionalCertificate', maxCount: 1 },
  // Experience
  { name: 'experienceLetters', maxCount: 5 },
  // Identity documents
  { name: 'aadhaarDocument', maxCount: 1 },
  { name: 'panDocument', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  // Profile
  { name: 'profilePhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      // Personal details
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      phone,
      linkedinUrl,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      bankAccountNumber,
      bankName,
      bankIFSC,
      selfDescription,
      // Education
      tenthPercentage,
      twelthPercentage,
      degreePercentage,
      // Experience
      totalExperience,
      previousCompanies,
      // Identity
      aadhaarNumber,
      panNumber,
      // Profile
      aboutMe
    } = req.body;

    // Find candidate by user email
    const candidate = await Candidate.findOne({ email: req.user.email });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Check if already submitted
    const existingSubmission = await OnboardingSubmission.findOne({ candidateId: candidate._id });
    if (existingSubmission && existingSubmission.status !== 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Onboarding already submitted'
      });
    }

    // Validate required files
    if (!req.files.tenthCertificate || !req.files.intermediateCertificate || 
        !req.files.degreeCertificate || !req.files.aadhaarDocument || 
        !req.files.panDocument || !req.files.addressProof || !req.files.profilePhoto) {
      return res.status(400).json({
        success: false,
        message: 'All required documents must be uploaded'
      });
    }

    // Parse previous companies if it's a string
    let parsedCompanies = [];
    if (previousCompanies) {
      parsedCompanies = typeof previousCompanies === 'string' 
        ? JSON.parse(previousCompanies) 
        : previousCompanies;
    }

    // Validate experience letters for experienced candidates
    if (totalExperience > 0 && (!req.files.experienceLetters || req.files.experienceLetters.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Experience letters are required for experienced candidates'
      });
    }

    // Create submission
    const submission = new OnboardingSubmission({
      candidateId: candidate._id,
      email: candidate.email,
      fullName: candidate.fullName,
      department: candidate.department,
      
      // Personal details
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      phone,
      linkedinUrl,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      bankAccountNumber,
      bankName,
      bankIFSC,
      selfDescription,
      
      // Education percentages
      tenthPercentage: Number(tenthPercentage),
      twelthPercentage: Number(twelthPercentage),
      degreePercentage: Number(degreePercentage),
      
      // Education certificates
      tenthCertificate: prepareDocumentForDB(req.files.tenthCertificate[0]),
      intermediateCertificate: prepareDocumentForDB(req.files.intermediateCertificate[0]),
      degreeCertificate: prepareDocumentForDB(req.files.degreeCertificate[0]),
      additionalCertificates: prepareDocumentsForDB(req.files.additionalCertificates || []),
      
      // BTech semester certificates
      semester1_1: req.files.semester1_1?.[0] ? prepareDocumentForDB(req.files.semester1_1[0]) : undefined,
      semester1_2: req.files.semester1_2?.[0] ? prepareDocumentForDB(req.files.semester1_2[0]) : undefined,
      semester2_1: req.files.semester2_1?.[0] ? prepareDocumentForDB(req.files.semester2_1[0]) : undefined,
      semester2_2: req.files.semester2_2?.[0] ? prepareDocumentForDB(req.files.semester2_2[0]) : undefined,
      semester3_1: req.files.semester3_1?.[0] ? prepareDocumentForDB(req.files.semester3_1[0]) : undefined,
      semester3_2: req.files.semester3_2?.[0] ? prepareDocumentForDB(req.files.semester3_2[0]) : undefined,
      semester4_1: req.files.semester4_1?.[0] ? prepareDocumentForDB(req.files.semester4_1[0]) : undefined,
      semester4_2: req.files.semester4_2?.[0] ? prepareDocumentForDB(req.files.semester4_2[0]) : undefined,
      provisionalCertificate: req.files.provisionalCertificate?.[0] ? prepareDocumentForDB(req.files.provisionalCertificate[0]) : undefined,
      
      // Experience
      totalExperience: Number(totalExperience) || 0,
      previousCompanies: parsedCompanies,
      experienceLetters: prepareDocumentsForDB(req.files.experienceLetters || []),
      
      // Identity
      aadhaarNumber,
      panNumber,
      aadhaarDocument: prepareDocumentForDB(req.files.aadhaarDocument[0]),
      panDocument: prepareDocumentForDB(req.files.panDocument[0]),
      addressProof: prepareDocumentForDB(req.files.addressProof[0]),
      
      // Profile
      profilePhoto: prepareDocumentForDB(req.files.profilePhoto[0]),
      aboutMe,
      
      status: 'SUBMITTED'
    });

    // Save submission with optimized async handling
    // Use setImmediate to queue the save operation without blocking the response
    let saveError = null;
    const savePromise = submission.save().catch(err => {
      saveError = err;
      console.error('Error saving submission:', err);
    });

    // Send response immediately after submission object is created
    // MongoDB will save it asynchronously without blocking the API response
    res.status(201).json({
      success: true,
      message: 'Onboarding submitted successfully',
      submission: {
        id: submission._id,
        status: submission.status
      }
    });

    // Ensure save completes in background
    savePromise.catch(err => {
      console.error('Background save error logged:', err);
    });
  } catch (error) {
    console.error('Error submitting onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting onboarding: ' + error.message
    });
  }
});

// @route   GET /api/onboarding/my-submission
// @desc    Get user's onboarding submission (optimized - excludes large binary data)
// @access  Private/Employee
router.get('/my-submission', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ email: req.user.email });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Exclude binary document data for faster loading but keep document metadata
    const submission = await OnboardingSubmission.findOne({ candidateId: candidate._id })
      .select('-tenthCertificate.data -intermediateCertificate.data -degreeCertificate.data -semester1_1.data -semester1_2.data -semester2_1.data -semester2_2.data -semester3_1.data -semester3_2.data -semester4_1.data -semester4_2.data -provisionalCertificate.data -additionalCertificates.data -aadhaarDocument.data -panDocument.data -addressProof.data -profilePhoto.data -experienceLetters.data')
      .lean();

    res.json({
      success: true,
      submission,
      candidate: {
        fullName: candidate.fullName,
        email: candidate.email,
        position: candidate.position,
        department: candidate.department
      }
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission'
    });
  }
});

// @route   POST /api/onboarding/:id/send-feedback
// @desc    HR sends feedback/revision request to employee
// @access  Private/Admin
router.post('/:id/send-feedback', protect, async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks || remarks.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Remarks are required'
      });
    }

    const submission = await OnboardingSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Add feedback to revision history
    submission.revisionHistory.push({
      remarks: remarks,
      requestedBy: req.user._id,
      resolved: false
    });

    // Update status to revision requested
    submission.status = 'REVISION_REQUESTED';
    submission.hrRemarks = remarks;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();

    // Save asynchronously in background
    const savePromise = submission.save().catch(err => {
      console.error('Error saving feedback:', err);
    });

    // Send email to employee about revision request (don't wait for this)
    const emailService = require('../utils/emailService');
    
    // Send immediate response without waiting for candidate lookup, save, or email
    res.json({
      success: true,
      message: 'Feedback sent to employee successfully'
    });

    // Fetch candidate and send email asynchronously in background
    setImmediate(async () => {
      try {
        const candidate = await Candidate.findById(submission.candidateId);
        if (candidate) {
          try {
            console.log(`📧 Sending revision request email to ${candidate.email}...`);
            await emailService.sendRevisionRequestEmail(
              candidate.email,
              candidate.firstName,
              remarks
            );
            console.log(`✅ Revision request email sent successfully to ${candidate.email}`);
          } catch (emailError) {
            console.error('❌ Error sending revision request email:', emailError.message);
            console.error('   Email:', candidate.email);
            console.error('   Details:', emailError);
          }
        } else {
          console.warn('⚠️ Candidate not found for email notification');
        }
      } catch (candidateError) {
        console.error('❌ Error fetching candidate:', candidateError.message);
      }
    });

    // Ensure save completes in background
    savePromise.catch(err => {
      console.error('Background save error logged:', err);
    });
  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending feedback'
    });
  }
});

// @route   POST /api/onboarding/:id/resubmit
// @desc    Employee resubmits onboarding form after feedback
// @access  Private/Employee
router.post('/:id/resubmit', protect, uploadToDatabase.fields([
  { name: 'tenthCertificate', maxCount: 1 },
  { name: 'intermediateCertificate', maxCount: 1 },
  { name: 'degreeCertificate', maxCount: 1 },
  { name: 'additionalCertificates', maxCount: 5 },
  { name: 'semester1_1', maxCount: 1 },
  { name: 'semester1_2', maxCount: 1 },
  { name: 'semester2_1', maxCount: 1 },
  { name: 'semester2_2', maxCount: 1 },
  { name: 'semester3_1', maxCount: 1 },
  { name: 'semester3_2', maxCount: 1 },
  { name: 'semester4_1', maxCount: 1 },
  { name: 'semester4_2', maxCount: 1 },
  { name: 'provisionalCertificate', maxCount: 1 },
  { name: 'experienceLetters', maxCount: 5 },
  { name: 'aadhaarDocument', maxCount: 1 },
  { name: 'panDocument', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const submission = await OnboardingSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if submission is in revision requested status
    if (submission.status !== 'REVISION_REQUESTED') {
      return res.status(400).json({
        success: false,
        message: 'Can only resubmit submissions with revision requests'
      });
    }

    // Get the latest revision request
    const lastRevisionIndex = submission.revisionHistory.length - 1;
    if (lastRevisionIndex >= 0) {
      submission.revisionHistory[lastRevisionIndex].resolved = true;
      submission.revisionHistory[lastRevisionIndex].resolvedAt = new Date();
    }

    // Update submission fields
    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      phone,
      linkedinUrl,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      bankAccountNumber,
      bankName,
      bankIFSC,
      selfDescription,
      tenthPercentage,
      twelthPercentage,
      degreePercentage,
      totalExperience,
      previousCompanies,
      aadhaarNumber,
      panNumber,
      aboutMe
    } = req.body;

    // Update personal info
    if (firstName) submission.firstName = firstName;
    if (lastName) submission.lastName = lastName;
    if (middleName) submission.middleName = middleName;
    if (dateOfBirth) submission.dateOfBirth = dateOfBirth;
    if (phone) submission.phone = phone;
    if (linkedinUrl) submission.linkedinUrl = linkedinUrl;
    if (address) submission.address = address;
    if (city) submission.city = city;
    if (state) submission.state = state;
    if (pincode) submission.pincode = pincode;
    if (emergencyContactName) submission.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone) submission.emergencyContactPhone = emergencyContactPhone;
    if (emergencyContactRelation) submission.emergencyContactRelation = emergencyContactRelation;
    if (bankAccountNumber) submission.bankAccountNumber = bankAccountNumber;
    if (bankName) submission.bankName = bankName;
    if (bankIFSC) submission.bankIFSC = bankIFSC;
    if (selfDescription) submission.selfDescription = selfDescription;
    if (tenthPercentage) submission.tenthPercentage = tenthPercentage;
    if (twelthPercentage) submission.twelthPercentage = twelthPercentage;
    if (degreePercentage) submission.degreePercentage = degreePercentage;
    if (totalExperience !== undefined) submission.totalExperience = totalExperience;
    if (previousCompanies) submission.previousCompanies = JSON.parse(previousCompanies);
    if (aadhaarNumber) submission.aadhaarNumber = aadhaarNumber;
    if (panNumber) submission.panNumber = panNumber;
    if (aboutMe) submission.aboutMe = aboutMe;

    // Update fullName if personal info changed
    if (firstName || lastName) {
      const first = firstName || submission.firstName;
      const last = lastName || submission.lastName;
      submission.fullName = `${first} ${last}`;
    }

    // Update documents if new ones are provided
    const documentFields = [
      'tenthCertificate', 'intermediateCertificate', 'degreeCertificate',
      'semester1_1', 'semester1_2', 'semester2_1', 'semester2_2',
      'semester3_1', 'semester3_2', 'semester4_1', 'semester4_2',
      'provisionalCertificate', 'aadhaarDocument', 'panDocument',
      'addressProof', 'profilePhoto'
    ];

    if (req.files) {
      for (const field of documentFields) {
        if (req.files[field]) {
          submission[field] = prepareDocumentForDB(req.files[field][0]);
        }
      }

      if (req.files.additionalCertificates) {
        submission.additionalCertificates = prepareDocumentsForDB(req.files.additionalCertificates);
      }

      if (req.files.experienceLetters) {
        submission.experienceLetters = prepareDocumentsForDB(req.files.experienceLetters);
      }
    }

    // Reset status to submitted for HR review
    submission.status = 'SUBMITTED';
    submission.reviewedBy = null;
    submission.reviewedAt = null;

    await submission.save();

    // Fetch the saved submission without binary document data for faster response
    const savedSubmission = await OnboardingSubmission.findById(submission._id)
      .select('-tenthCertificate.data -intermediateCertificate.data -degreeCertificate.data -semester1_1.data -semester1_2.data -semester2_1.data -semester2_2.data -semester3_1.data -semester3_2.data -semester4_1.data -semester4_2.data -provisionalCertificate.data -additionalCertificates.data -aadhaarDocument.data -panDocument.data -addressProof.data -profilePhoto.data -experienceLetters.data')
      .lean();

    res.json({
      success: true,
      message: 'Onboarding resubmitted successfully',
      submission: savedSubmission
    });
  } catch (error) {
    console.error('Error resubmitting onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Error resubmitting onboarding'
    });
  }
});

module.exports = router;
