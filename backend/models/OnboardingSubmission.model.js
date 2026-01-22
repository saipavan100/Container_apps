const mongoose = require('mongoose');

const onboardingSubmissionSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  middleName: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  linkedinUrl: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  
  // Emergency Contact
  emergencyContactName: {
    type: String,
    required: true
  },
  emergencyContactPhone: {
    type: String,
    required: true
  },
  emergencyContactRelation: {
    type: String,
    required: true
  },
  
  // Bank Details
  bankAccountNumber: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  bankIFSC: {
    type: String,
    required: true
  },
  
  selfDescription: {
    type: String,
    required: true
  },
  
  // Educational Information
  tenthPercentage: {
    type: Number,
    required: true
  },
  twelthPercentage: {
    type: Number,
    required: true
  },
  degreePercentage: {
    type: Number,
    required: true
  },
  tenthCertificate: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  intermediateCertificate: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  // BTech Semester Certificates
  semester1_1: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  semester1_2: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  semester2_1: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  semester2_2: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  semester3_1: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  semester3_2: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  semester4_1: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  semester4_2: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  provisionalCertificate: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  degreeCertificate: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  additionalCertificates: [{
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  }],
  
  // Experience Information
  totalExperience: {
    type: Number,
    required: true,
    min: 0
  },
  previousCompanies: [{
    companyName: String,
    designation: String,
    duration: String
  }],
  experienceLetters: [{
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  }],
  
  // Identity Documents
  aadhaarNumber: {
    type: String,
    required: true,
    match: /^\d{12}$/
  },
  panNumber: {
    type: String,
    required: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  },
  aadhaarDocument: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  panDocument: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  addressProof: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  
  // Profile Information
  profilePhoto: {
    data: { type: String },
    contentType: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  aboutMe: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Submission Status
  status: {
    type: String,
    enum: ['SUBMITTED', 'APPROVED', 'REJECTED', 'PASS_SENT', 'PASS_ACCEPTED', 'REVISION_REQUESTED'],
    default: 'SUBMITTED'
  },
  hrRemarks: {
    type: String
  },
  revisionHistory: [{
    remarks: String,
    requestedAt: {
      type: Date,
      default: Date.now
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  
  // Onboarding Pass
  onboardingPassToken: {
    type: String
  },
  onboardingPassSentAt: {
    type: Date
  },
  onboardingPassAcceptedAt: {
    type: Date
  },
  dateOfJoining: {
    type: Date
  },
  
  // Employee Creation
  employeeCreated: {
    type: Boolean,
    default: false
  },
  employeeId: {
    type: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OnboardingSubmission', onboardingSubmissionSchema);
