const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  onboardingSubmissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OnboardingSubmission',
    required: true
  },
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
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  linkedinUrl: {
    type: String
  },
  reportingManager: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String
  },
  aboutMe: {
    type: String
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documents: {
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
    experienceLetters: [{
      data: { type: String },
      contentType: { type: String },
      filename: { type: String },
      uploadedAt: { type: Date }
    }],
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
    profilePhoto: {
      data: { type: String },
      contentType: { type: String },
      filename: { type: String },
      uploadedAt: { type: Date }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
