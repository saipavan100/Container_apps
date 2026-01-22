import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiUpload, FiPlus, FiTrash2, FiUser, FiBook,
  FiBriefcase, FiCreditCard, FiLogOut, FiSave
} from 'react-icons/fi';
import api from '../../utils/api';
import { validateAadhaar, validatePAN, validateFile } from '../../utils/validation';
import './OnboardingForm.css';

const OnboardingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    linkedinUrl: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Bank Details
    bankAccountNumber: '',
    bankName: '',
    bankIFSC: '',
    
    selfDescription: '',
    
    // Education
    tenthPercentage: '',
    twelthPercentage: '',
    degreePercentage: '',
    tenthCertificate: null,
    intermediateCertificate: null,
    degreeCertificate: null,
    // BTech Semester Certificates
    semester1_1: null,
    semester1_2: null,
    semester2_1: null,
    semester2_2: null,
    semester3_1: null,
    semester3_2: null,
    semester4_1: null,
    semester4_2: null,
    provisionalCertificate: null,
    additionalCertificates: [],

    // Experience
    totalExperience: 0,
    previousCompanies: [],
    experienceLetters: [],

    // Identity
    aadhaarNumber: '',
    panNumber: '',
    aadhaarDocument: null,
    panDocument: null,
    addressProof: null,

    // Profile
    profilePhoto: null,
    aboutMe: ''
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [submissionLoaded, setSubmissionLoaded] = useState(false);
  const tabs = ['personal', 'education', 'experience', 'identity', 'profile'];

  // Determine the current onboarding state/page
  const getOnboardingState = () => {
    // If no submission exists - show form (first time)
    if (!submission) return 'FORM';
    
    // If approved - show approved page (check this early)
    if (submission.status === 'APPROVED') {
      return 'APPROVED';
    }
    
    // Check if there are any unresolved revisions
    const hasUnresolvedRevisions = submission.revisionHistory?.some(rev => !rev.resolved);
    
    // If submitted but NO unresolved revisions - show under review page
    if (submission.status === 'SUBMITTED' && !hasUnresolvedRevisions) {
      return 'UNDER_REVIEW';
    }
    
    // If revision is requested (status is REVISION_REQUESTED) or has unresolved revisions - show revision page
    if (submission.status === 'REVISION_REQUESTED' || hasUnresolvedRevisions) {
      if (isEditing) return 'FORM';
      return 'REVISION';
    }
    
    // Default to form
    return 'FORM';
  };

  useEffect(() => {
    fetchCandidateInfo();
  }, []);

  const goToNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const fetchCandidateInfo = async () => {
    try {
      const response = await api.get('/onboarding/my-submission');
      setCandidateInfo(response.data.candidate);
      setSubmission(response.data.submission);

      // If this is a revision request, populate form with existing data
      if (response.data.submission && response.data.submission.status === 'REVISION_REQUESTED') {
        const sub = response.data.submission;
        setFormData({
          firstName: sub.firstName || '',
          lastName: sub.lastName || '',
          middleName: sub.middleName || '',
          dateOfBirth: sub.dateOfBirth ? sub.dateOfBirth.split('T')[0] : '',
          phone: sub.phone || '',
          address: sub.address || '',
          city: sub.city || '',
          state: sub.state || '',
          pincode: sub.pincode || '',
          linkedinUrl: sub.linkedinUrl || '',
          emergencyContactName: sub.emergencyContactName || '',
          emergencyContactPhone: sub.emergencyContactPhone || '',
          emergencyContactRelation: sub.emergencyContactRelation || '',
          bankAccountNumber: sub.bankAccountNumber || '',
          bankName: sub.bankName || '',
          bankIFSC: sub.bankIFSC || '',
          selfDescription: sub.selfDescription || '',
          tenthPercentage: sub.tenthPercentage || '',
          twelthPercentage: sub.twelthPercentage || '',
          degreePercentage: sub.degreePercentage || '',
          tenthCertificate: sub.tenthCertificate ? 'existing' : null,
          intermediateCertificate: sub.intermediateCertificate ? 'existing' : null,
          degreeCertificate: sub.degreeCertificate ? 'existing' : null,
          semester1_1: sub.semester1_1 ? 'existing' : null,
          semester1_2: sub.semester1_2 ? 'existing' : null,
          semester2_1: sub.semester2_1 ? 'existing' : null,
          semester2_2: sub.semester2_2 ? 'existing' : null,
          semester3_1: sub.semester3_1 ? 'existing' : null,
          semester3_2: sub.semester3_2 ? 'existing' : null,
          semester4_1: sub.semester4_1 ? 'existing' : null,
          semester4_2: sub.semester4_2 ? 'existing' : null,
          provisionalCertificate: sub.provisionalCertificate ? 'existing' : null,
          additionalCertificates: [],
          totalExperience: sub.totalExperience || 0,
          previousCompanies: sub.previousCompanies || [],
          experienceLetters: [],
          aadhaarNumber: sub.aadhaarNumber || '',
          panNumber: sub.panNumber || '',
          aadhaarDocument: sub.aadhaarDocument ? 'existing' : null,
          panDocument: sub.panDocument ? 'existing' : null,
          addressProof: sub.addressProof ? 'existing' : null,
          profilePhoto: sub.profilePhoto ? 'existing' : null,
          aboutMe: sub.aboutMe || ''
        });
      }
      setSubmissionLoaded(true);
    } catch (error) {
      toast.error('Error fetching candidate information');
      setSubmissionLoaded(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleFileChange = (field, file, index = null) => {
    if (!file) return;

    const allowedTypes = field === 'profilePhoto' ? ['jpg', 'jpeg', 'png'] : ['pdf', 'jpg', 'jpeg', 'png'];
    const validation = validateFile(file, allowedTypes, 5);

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    if (field === 'additionalCertificates') {
      setFormData({
        ...formData,
        additionalCertificates: [...formData.additionalCertificates, file]
      });
    } else if (field === 'experienceLetters') {
      setFormData({
        ...formData,
        experienceLetters: [...formData.experienceLetters, file]
      });
    } else {
      setFormData({
        ...formData,
        [field]: file
      });
    }

    setErrors({ ...errors, [field]: '' });
  };

  const removeFile = (field, index) => {
    if (field === 'additionalCertificates') {
      const newFiles = formData.additionalCertificates.filter((_, i) => i !== index);
      setFormData({ ...formData, additionalCertificates: newFiles });
    } else if (field === 'experienceLetters') {
      const newFiles = formData.experienceLetters.filter((_, i) => i !== index);
      setFormData({ ...formData, experienceLetters: newFiles });
    }
  };

  const addCompany = () => {
    setFormData({
      ...formData,
      previousCompanies: [
        ...formData.previousCompanies,
        { companyName: '', designation: '', duration: '' }
      ]
    });
  };

  const updateCompany = (index, field, value) => {
    const newCompanies = [...formData.previousCompanies];
    newCompanies[index][field] = value;
    setFormData({ ...formData, previousCompanies: newCompanies });
  };

  const removeCompany = (index) => {
    const newCompanies = formData.previousCompanies.filter((_, i) => i !== index);
    setFormData({ ...formData, previousCompanies: newCompanies });
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Details validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.phone || formData.phone.length !== 10) {
      newErrors.phone = 'Valid 10-digit phone number is required';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode || formData.pincode.length !== 6) {
      newErrors.pincode = 'Valid 6-digit pincode is required';
    }

    // Education validation
    if (!formData.tenthCertificate) newErrors.tenthCertificate = 'Required';
    if (!formData.intermediateCertificate) newErrors.intermediateCertificate = 'Required';
    if (!formData.degreeCertificate) newErrors.degreeCertificate = 'Required';

    // Experience validation
    if (formData.totalExperience > 0 && formData.experienceLetters.length === 0) {
      newErrors.experienceLetters = 'Experience letters required for experienced candidates';
    }

    // Identity validation
    if (!validateAadhaar(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Invalid Aadhaar (12 digits required)';
    }
    if (!validatePAN(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Invalid PAN (Format: AAAAA9999A)';
    }
    if (!formData.aadhaarDocument) newErrors.aadhaarDocument = 'Required';
    if (!formData.panDocument) newErrors.panDocument = 'Required';
    if (!formData.addressProof) newErrors.addressProof = 'Required';

    // Profile validation
    if (!formData.profilePhoto) newErrors.profilePhoto = 'Required';
    if (!formData.aboutMe.trim()) {
      newErrors.aboutMe = 'Required';
    } else if (formData.aboutMe.length > 500) {
      newErrors.aboutMe = 'Maximum 500 characters allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();

    // Personal Details
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('middleName', formData.middleName);
    formDataToSend.append('dateOfBirth', formData.dateOfBirth);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('city', formData.city);
    formDataToSend.append('state', formData.state);
    formDataToSend.append('pincode', formData.pincode);
    formDataToSend.append('linkedinUrl', formData.linkedinUrl);
    
    // Emergency Contact
    formDataToSend.append('emergencyContactName', formData.emergencyContactName);
    formDataToSend.append('emergencyContactPhone', formData.emergencyContactPhone);
    formDataToSend.append('emergencyContactRelation', formData.emergencyContactRelation);
    
    // Bank Details
    formDataToSend.append('bankAccountNumber', formData.bankAccountNumber);
    formDataToSend.append('bankName', formData.bankName);
    formDataToSend.append('bankIFSC', formData.bankIFSC);
    
    formDataToSend.append('selfDescription', formData.selfDescription);

    // Education
    formDataToSend.append('tenthPercentage', formData.tenthPercentage);
    formDataToSend.append('twelthPercentage', formData.twelthPercentage);
    formDataToSend.append('degreePercentage', formData.degreePercentage);
    formDataToSend.append('tenthCertificate', formData.tenthCertificate);
    formDataToSend.append('intermediateCertificate', formData.intermediateCertificate);
    formDataToSend.append('degreeCertificate', formData.degreeCertificate);
    
    // BTech Semester Certificates
    if (formData.semester1_1) formDataToSend.append('semester1_1', formData.semester1_1);
    if (formData.semester1_2) formDataToSend.append('semester1_2', formData.semester1_2);
    if (formData.semester2_1) formDataToSend.append('semester2_1', formData.semester2_1);
    if (formData.semester2_2) formDataToSend.append('semester2_2', formData.semester2_2);
    if (formData.semester3_1) formDataToSend.append('semester3_1', formData.semester3_1);
    if (formData.semester3_2) formDataToSend.append('semester3_2', formData.semester3_2);
    if (formData.semester4_1) formDataToSend.append('semester4_1', formData.semester4_1);
    if (formData.semester4_2) formDataToSend.append('semester4_2', formData.semester4_2);
    if (formData.provisionalCertificate) formDataToSend.append('provisionalCertificate', formData.provisionalCertificate);
    
    formData.additionalCertificates.forEach(file => {
      formDataToSend.append('additionalCertificates', file);
    });

    formDataToSend.append('totalExperience', formData.totalExperience);
    formDataToSend.append('previousCompanies', JSON.stringify(formData.previousCompanies));
    formData.experienceLetters.forEach(file => {
      formDataToSend.append('experienceLetters', file);
    });

    formDataToSend.append('aadhaarNumber', formData.aadhaarNumber);
    formDataToSend.append('panNumber', formData.panNumber.toUpperCase());
    formDataToSend.append('aadhaarDocument', formData.aadhaarDocument);
    formDataToSend.append('panDocument', formData.panDocument);
    formDataToSend.append('addressProof', formData.addressProof);

    formDataToSend.append('profilePhoto', formData.profilePhoto);
    formDataToSend.append('aboutMe', formData.aboutMe);

    try {
      if (submission && submission.status === 'REVISION_REQUESTED') {
        // Resubmit with revision
        await api.post(`/onboarding/${submission._id}/resubmit`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Revised onboarding submitted successfully! HR will review your changes.');
        // Reset editing state and reload submission to show UNDER_REVIEW status
        setIsEditing(false);
        setSubmissionLoaded(false);
        // Immediately refetch to get updated status and show UNDER_REVIEW page
        setTimeout(() => {
          fetchCandidateInfo();
        }, 500);
      } else {
        // Initial submission
        await api.post('/onboarding/submit', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Onboarding submitted successfully! HR will review your submission.');
        // Reset editing state and reload submission to show UNDER_REVIEW status
        setIsEditing(false);
        setSubmissionLoaded(false);
        // Immediately refetch to get updated status and show UNDER_REVIEW page
        setTimeout(() => {
          fetchCandidateInfo();
        }, 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting onboarding');
    } finally {
      setLoading(false);
    }
  };

  // Show loading until submission is loaded
  if (!submissionLoaded) {
    return (
      <div className="onboarding-page">
        <div className="status-container">
          <div className="status-card fade-in">
            <div className="spinner" style={{ marginBottom: '20px' }}></div>
            <p>Loading your onboarding information...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentState = getOnboardingState();

  // PAGE 3: REVISION PAGE - Show when HR requests revisions
  if (currentState === 'REVISION') {
    const latestRevision = submission.revisionHistory?.[submission.revisionHistory.length - 1];
    const feedbackText = latestRevision?.remarks || latestRevision?.message || submission.hrRemarks || submission.hrFeedback || submission.feedback || 'Please review the revision history below for details.';
    
    console.log('Revision Page Debug:', {
      latestRevision,
      feedbackText,
      hrRemarks: submission.hrRemarks,
      revisionHistory: submission.revisionHistory,
      submissionStatus: submission.status
    });
    
    return (
      <div className="onboarding-page">
        <div className="status-container">
          <div className="status-card revision-required fade-in">
            <div className="status-icon status-revision_requested">
              📝
            </div>
            <h2>Revision Required</h2>
            <p>HR has reviewed your submission and requested some revisions. Please update your information and resubmit.</p>
            {feedbackText && (
              <div className="remarks-box revision-box">
                <h3>HR Feedback:</h3>
                <p>{feedbackText}</p>
              </div>
            )}
            {submission.revisionHistory && submission.revisionHistory.length > 0 && (
              <div className="revision-history-mini">
                <h4>Revision History ({submission.revisionHistory.length}):</h4>
                {submission.revisionHistory.map((revision, index) => (
                  <div key={index} className="revision-item-mini">
                    <small>Requested: {new Date(revision.requestedAt || revision.createdAt).toLocaleString()}</small>
                    <p>{revision.remarks || revision.message || revision.feedback || 'No feedback provided'}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="action-buttons-status">
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setActiveTab('personal');
                  window.scrollTo(0, 0);
                }}
                className="btn btn-primary btn-lg">
                📝 Update & Resubmit
              </button>
              <button onClick={handleLogout} className="btn btn-secondary">
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 2: UNDER REVIEW PAGE - Show when submission is with HR
  if (currentState === 'UNDER_REVIEW') {
    return (
      <div className="onboarding-page">
        <div className="status-container">
          <div className="status-card fade-in">
            <div className="status-icon">⏳</div>
            <h2>Under Review</h2>
            <p>Your onboarding submission is under review by HR. We will notify you once the review is complete.</p>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              You will receive an email notification for any updates or if revisions are needed.
            </p>
            <button onClick={handleLogout} className="btn btn-secondary">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 4: APPROVED PAGE - Show when onboarding is approved
  if (currentState === 'APPROVED') {
    return (
      <div className="onboarding-page">
        <div className="status-container">
          <div className="status-card fade-in">
            <div className="status-icon">✅</div>
            <h2>Approved!</h2>
            <p>Your onboarding has been approved! Welcome to Winwire! 🎉</p>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              You will receive further instructions via email.
            </p>
            <button onClick={handleLogout} className="btn btn-secondary">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 1: FORM PAGE - Show for first-time submission or when editing revision
  if (currentState === 'FORM') {
    return (
      <div className="onboarding-page">
        {/* Header */}
        <header className="onboarding-header fade-in">
          <div className="container">
            <div className="header-content">
              <div className="logo-section">
                <div className="winwire-logo-small">
                  <span className="logo-win-small">Win</span><span className="logo-wire-small">Wire</span>
                </div>
                <div>
                  <h1>Winwire Onboarding</h1>
                  <p>Welcome, {candidateInfo?.fullName}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary">
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </header>

        <div className="container">
          {/* Candidate Info */}
          {candidateInfo && (
            <div className="info-banner fade-in-up">
              <div className="info-item">
                <label>Position</label>
                <p>{candidateInfo.position}</p>
              </div>
              <div className="info-item">
                <label>Department</label>
                <p>{candidateInfo.department}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{candidateInfo.email}</p>
              </div>
            </div>
          )}

          {/* Status indicator when editing revision */}
          {isEditing && submission && (
            <div className="alert alert-info" style={{
              backgroundColor: '#E8F4FD',
              border: '1px solid #B3D9E8',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              color: '#0056B3'
            }}>
              <strong>📝 Revision Mode:</strong> Please address the feedback and update your submission.
            </div>
          )}

          {/* Form */}
          <div className="onboarding-form-container fade-in">
            <h2>{isEditing ? 'Update Your Onboarding' : 'Complete Your Onboarding'}</h2>
            <p className="form-subtitle">
              {isEditing 
                ? 'Please address the feedback and update the required information'
                : 'Please fill all required information and upload necessary documents'}
            </p>

            {/* Tabs */}
            <div className="tabs">
            <button
              className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <FiUser /> Personal Details
            </button>
            <button
              className={`tab ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <FiBook /> Education
            </button>
            <button
              className={`tab ${activeTab === 'experience' ? 'active' : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              <FiBriefcase /> Experience
            </button>
            <button
              className={`tab ${activeTab === 'identity' ? 'active' : ''}`}
              onClick={() => setActiveTab('identity')}
            >
              <FiCreditCard /> Identity
            </button>
            <button
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FiUser /> Profile
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Details Tab */}
            {activeTab === 'personal' && (
              <div className="tab-content fade-in">
                <h3>Personal Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Middle Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.middleName}
                      onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      maxLength="10"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">State</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Pincode</label>
                    <input
                      type="text"
                      className="form-control"
                      maxLength="6"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                      required
                    />
                  </div>
                </div>

                <h3 style={{marginTop: '30px'}}>Emergency Contact</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      maxLength="10"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value.replace(/\D/g, '')})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Relation</label>
                    <select
                      className="form-control"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                      required
                    >
                      <option value="">Select Relation</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <h3 style={{marginTop: '30px'}}>Bank Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Bank Account Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Bank Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">IFSC Code</label>
                    <input
                      type="text"
                      className="form-control"
                      maxLength="11"
                      value={formData.bankIFSC}
                      onChange={(e) => setFormData({...formData, bankIFSC: e.target.value.toUpperCase()})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Self Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Tell us about yourself, your skills, interests, and career goals..."
                    value={formData.selfDescription}
                    onChange={(e) => setFormData({...formData, selfDescription: e.target.value})}
                    maxLength="500"
                    required
                  />
                  <small>{formData.selfDescription.length}/500 characters</small>
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="tab-content fade-in">
                <h3>Educational Certificates</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">10th Percentage</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tenthPercentage}
                      onChange={(e) => setFormData({...formData, tenthPercentage: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">12th/Intermediate Percentage</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.twelthPercentage}
                      onChange={(e) => setFormData({...formData, twelthPercentage: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Degree/BTech Percentage</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.degreePercentage}
                      onChange={(e) => setFormData({...formData, degreePercentage: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">10th Certificate</label>
                  <div className={`file-upload ${formData.tenthCertificate ? 'active' : ''}`}>
                    <input
                      type="file"
                      id="tenthCert"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('tenthCertificate', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="tenthCert" style={{ cursor: 'pointer', width: '100%' }}>
                      <FiUpload size={24} />
                      <p>{
                        formData.tenthCertificate && typeof formData.tenthCertificate === 'object' 
                          ? formData.tenthCertificate.name 
                          : formData.tenthCertificate === 'existing'
                          ? '✅ Previous document - click to replace'
                          : 'Upload 10th Certificate'
                      }</p>
                    </label>
                  </div>
                  {errors.tenthCertificate && <span className="error-message">{errors.tenthCertificate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">Intermediate/Diploma Certificate</label>
                  <div className={`file-upload ${formData.intermediateCertificate ? 'active' : ''}`}>
                    <input
                      type="file"
                      id="intermediateCert"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('intermediateCertificate', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="intermediateCert" style={{ cursor: 'pointer', width: '100%' }}>
                      <FiUpload size={24} />
                      <p>{
                        formData.intermediateCertificate && typeof formData.intermediateCertificate === 'object' 
                          ? formData.intermediateCertificate.name 
                          : formData.intermediateCertificate === 'existing'
                          ? '✅ Previous document - click to replace'
                          : 'Upload Intermediate Certificate'
                      }</p>
                    </label>
                  </div>
                  {errors.intermediateCertificate && <span className="error-message">{errors.intermediateCertificate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">BTech/Degree Certificate</label>
                  <div className={`file-upload ${formData.degreeCertificate ? 'active' : ''}`}>
                    <input
                      type="file"
                      id="degreeCert"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('degreeCertificate', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="degreeCert" style={{ cursor: 'pointer', width: '100%' }}>
                      <FiUpload size={24} />
                      <p>{
                        formData.degreeCertificate && typeof formData.degreeCertificate === 'object' 
                          ? formData.degreeCertificate.name 
                          : formData.degreeCertificate === 'existing'
                          ? '✅ Previous document - click to replace'
                          : 'Upload Degree Certificate'
                      }</p>
                    </label>
                  </div>
                  {errors.degreeCertificate && <span className="error-message">{errors.degreeCertificate}</span>}
                </div>

                <h3 style={{marginTop: '30px'}}>BTech Semester Certificates</h3>
                <p style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>Upload all semester mark sheets (1-1 through 4-2) and provisional certificate</p>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Semester 1-1</label>
                    <div className={`file-upload ${formData.semester1_1 ? 'active' : ''}`}>
                      <input
                        type="file"
                        id="sem1_1"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('semester1_1', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="sem1_1" style={{ cursor: 'pointer', width: '100%' }}>
                        <FiUpload size={20} />
                        <p style={{fontSize: '13px'}}>{formData.semester1_1 && typeof formData.semester1_1 === 'object' ? formData.semester1_1.name : formData.semester1_1 === 'existing' ? '✅ Previous document - click to replace' : 'Upload Semester 1-1'}</p>
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester 1-2</label>
                    <div className={`file-upload ${formData.semester1_2 ? 'active' : ''}`}>
                      <input
                        type="file"
                        id="sem1_2"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('semester1_2', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="sem1_2" style={{ cursor: 'pointer', width: '100%' }}>
                        <FiUpload size={20} />
                        <p style={{fontSize: '13px'}}>{formData.semester1_2 && typeof formData.semester1_2 === 'object' ? formData.semester1_2.name : formData.semester1_2 === 'existing' ? '✅ Previous document - click to replace' : 'Upload Semester 1-2'}</p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Semester 2-1</label>
                    <div className={`file-upload ${formData.semester2_1 ? 'active' : ''}`}>
                      <input
                        type="file"
                        id="sem2_1"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('semester2_1', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="sem2_1" style={{ cursor: 'pointer', width: '100%' }}>
                        <FiUpload size={20} />
                        <p style={{fontSize: '13px'}}>{formData.semester2_1 && typeof formData.semester2_1 === 'object' ? formData.semester2_1.name : formData.semester2_1 === 'existing' ? '✅ Previous document - click to replace' : 'Upload Semester 2-1'}</p>
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester 2-2</label>
                    <div className={`file-upload ${formData.semester2_2 ? 'active' : ''}`}>
                      <input
                        type="file"
                        id="sem2_2"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('semester2_2', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="sem2_2" style={{ cursor: 'pointer', width: '100%' }}>
                        <FiUpload size={20} />
                        <p style={{fontSize: '13px'}}>{formData.semester2_2 && typeof formData.semester2_2 === 'object' ? formData.semester2_2.name : formData.semester2_2 === 'existing' ? '✅ Previous document - click to replace' : 'Upload Semester 2-2'}</p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Semester 3-1</label>
                    <div className={`file-upload ${formData.semester3_1 ? 'active' : ''}`}>
                      <input
                        type="file"
                        id="sem3_1"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('semester3_1', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="sem3_1" style={{ cursor: 'pointer', width: '100%' }}>
                        <FiUpload size={20} />
                        <p style={{fontSize: '13px'}}>{formData.semester3_1 && typeof formData.semester3_1 === 'object' ? formData.semester3_1.name : formData.semester3_1 === 'existing' ? '✅ Previous document - click to replace' : 'Upload Semester 3-1'}</p>
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester 3-2</label>
                    <div className={`file-upload ${formData.semester3_2 ? 'active' : ''}`}>
                      <input
                        type="file"
                        id="sem3_2"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('semester3_2', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="sem3_2" style={{ cursor: 'pointer', width: '100%' }}>
                        <FiUpload size={20} />
                        <p style={{fontSize: '13px'}}>{formData.semester3_2 && typeof formData.semester3_2 === 'object' ? formData.semester3_2.name : formData.semester3_2 === 'existing' ? '✅ Previous document - click to replace' : 'Upload Semester 3-2'}</p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Semester 4-1</label>
                    <div className={`file-upload ${formData.semester4_1 ? 'active' : ''}`}>
                      <input
                        type="file"
                        id="sem4_1"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('semester4_1', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="sem4_1" style={{ cursor: 'pointer', width: '100%' }}>
                        <FiUpload size={20} />
                        <p style={{fontSize: '13px'}}>{formData.semester4_1 && typeof formData.semester4_1 === 'object' ? formData.semester4_1.name : formData.semester4_1 === 'existing' ? '✅ Previous document - click to replace' : 'Upload Semester 4-1'}</p>
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester 4-2</label>
                    <div className={`file-upload ${formData.semester4_2 ? 'active' : ''}`}>
                      <input
                        type="file"
                        id="sem4_2"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('semester4_2', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="sem4_2" style={{ cursor: 'pointer', width: '100%' }}>
                        <FiUpload size={20} />
                        <p style={{fontSize: '13px'}}>{formData.semester4_2 && typeof formData.semester4_2 === 'object' ? formData.semester4_2.name : formData.semester4_2 === 'existing' ? '✅ Previous document - click to replace' : 'Upload Semester 4-2'}</p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Provisional Certificate</label>
                  <div className={`file-upload ${formData.provisionalCertificate ? 'active' : ''}`}>
                    <input
                      type="file"
                      id="provisional"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('provisionalCertificate', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="provisional" style={{ cursor: 'pointer', width: '100%' }}>
                      <FiUpload size={24} />
                      <p>{formData.provisionalCertificate && typeof formData.provisionalCertificate === 'object' ? formData.provisionalCertificate.name : formData.provisionalCertificate === 'existing' ? '✅ Previous document - click to replace' : 'Upload Provisional Certificate'}</p>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Certifications (Optional)</label>
                  {formData.additionalCertificates.map((file, index) => (
                    <div key={index} className="uploaded-file">
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeFile('additionalCertificates', index)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  {formData.additionalCertificates.length < 5 && (
                    <div className="file-upload">
                      <input
                        type="file"
                        id="additionalCerts"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('additionalCertificates', e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="additionalCerts" style={{ cursor: 'pointer', width: '100%' }}>
                        <FiPlus size={24} />
                        <p>Add Additional Certificate</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="tab-content fade-in">
                <h3>Work Experience</h3>

                <div className="form-group">
                  <label className="form-label required">Total Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    className="form-control"
                    value={formData.totalExperience}
                    onChange={(e) => setFormData({ ...formData, totalExperience: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {formData.totalExperience > 0 && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Previous Companies</label>
                      {formData.previousCompanies.map((company, index) => (
                        <div key={index} className="company-entry">
                          <input
                            type="text"
                            placeholder="Company Name"
                            className="form-control"
                            value={company.companyName}
                            onChange={(e) => updateCompany(index, 'companyName', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Designation"
                            className="form-control"
                            value={company.designation}
                            onChange={(e) => updateCompany(index, 'designation', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g., 2 years)"
                            className="form-control"
                            value={company.duration}
                            onChange={(e) => updateCompany(index, 'duration', e.target.value)}
                          />
                          <button type="button" onClick={() => removeCompany(index)} className="btn-icon-danger">
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addCompany} className="btn btn-secondary">
                        <FiPlus /> Add Company
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Experience/Relieving Letters</label>
                      {formData.experienceLetters.map((file, index) => (
                        <div key={index} className="uploaded-file">
                          <span>{file.name}</span>
                          <button type="button" onClick={() => removeFile('experienceLetters', index)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                      {formData.experienceLetters.length < 5 && (
                        <div className="file-upload">
                          <input
                            type="file"
                            id="expLetters"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('experienceLetters', e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="expLetters" style={{ cursor: 'pointer', width: '100%' }}>
                            <FiPlus size={24} />
                            <p>Add Experience Letter</p>
                          </label>
                        </div>
                      )}
                      {errors.experienceLetters && <span className="error-message">{errors.experienceLetters}</span>}
                    </div>
                  </>
                )}

                {formData.totalExperience === 0 && (
                  <div className="info-message">
                    <p>You are marked as a fresher. No experience documentation required.</p>
                  </div>
                )}
              </div>
            )}

            {/* Identity Tab */}
            {activeTab === 'identity' && (
              <div className="tab-content fade-in">
                <h3>Identity & Address Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Aadhaar Number</label>
                    <input
                      type="text"
                      className={`form-control ${errors.aadhaarNumber ? 'error' : ''}`}
                      placeholder="12-digit Aadhaar number"
                      maxLength="12"
                      value={formData.aadhaarNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, aadhaarNumber: value });
                        setErrors({ ...errors, aadhaarNumber: '' });
                      }}
                    />
                    {errors.aadhaarNumber && <span className="error-message">{errors.aadhaarNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label required">PAN Number</label>
                    <input
                      type="text"
                      className={`form-control ${errors.panNumber ? 'error' : ''}`}
                      placeholder="AAAAA9999A"
                      maxLength="10"
                      style={{ textTransform: 'uppercase' }}
                      value={formData.panNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, panNumber: e.target.value.toUpperCase() });
                        setErrors({ ...errors, panNumber: '' });
                      }}
                    />
                    {errors.panNumber && <span className="error-message">{errors.panNumber}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Aadhaar Card Document</label>
                  <div className={`file-upload ${formData.aadhaarDocument ? 'active' : ''}`}>
                    <input
                      type="file"
                      id="aadhaarDoc"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('aadhaarDocument', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="aadhaarDoc" style={{ cursor: 'pointer', width: '100%' }}>
                      <FiUpload size={24} />
                      <p>{
                        formData.aadhaarDocument && typeof formData.aadhaarDocument === 'object' 
                          ? formData.aadhaarDocument.name 
                          : formData.aadhaarDocument === 'existing'
                          ? '✅ Previous document - click to replace'
                          : 'Upload Aadhaar Document'
                      }</p>
                    </label>
                  </div>
                  {errors.aadhaarDocument && <span className="error-message">{errors.aadhaarDocument}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">PAN Card Document</label>
                  <div className={`file-upload ${formData.panDocument ? 'active' : ''}`}>
                    <input
                      type="file"
                      id="panDoc"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('panDocument', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="panDoc" style={{ cursor: 'pointer', width: '100%' }}>
                      <FiUpload size={24} />
                      <p>{
                        formData.panDocument && typeof formData.panDocument === 'object' 
                          ? formData.panDocument.name 
                          : formData.panDocument === 'existing'
                          ? '✅ Previous document - click to replace'
                          : 'Upload PAN Document'
                      }</p>
                    </label>
                  </div>
                  {errors.panDocument && <span className="error-message">{errors.panDocument}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">Address Proof</label>
                  <div className={`file-upload ${formData.addressProof ? 'active' : ''}`}>
                    <input
                      type="file"
                      id="addressProof"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('addressProof', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="addressProof" style={{ cursor: 'pointer', width: '100%' }}>
                      <FiUpload size={24} />
                      <p>{
                        formData.addressProof && typeof formData.addressProof === 'object' 
                          ? formData.addressProof.name 
                          : formData.addressProof === 'existing'
                          ? '✅ Previous document - click to replace'
                          : 'Upload Address Proof'
                      }</p>
                    </label>
                  </div>
                  {errors.addressProof && <span className="error-message">{errors.addressProof}</span>}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="tab-content fade-in">
                <h3>Profile Information</h3>

                <div className="form-group">
                  <label className="form-label required">Profile Photo</label>
                  <div className={`file-upload ${formData.profilePhoto ? 'active' : ''}`}>
                    <input
                      type="file"
                      id="profilePhoto"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('profilePhoto', e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="profilePhoto" style={{ cursor: 'pointer', width: '100%' }}>
                      <FiUpload size={24} />
                      <p>{
                        formData.profilePhoto && typeof formData.profilePhoto === 'object' 
                          ? formData.profilePhoto.name 
                          : formData.profilePhoto === 'existing'
                          ? 'Previous photo uploaded - click to replace'
                          : 'Upload Profile Photo (JPG/PNG only)'
                      }</p>
                    </label>
                  </div>
                  {formData.profilePhoto && typeof formData.profilePhoto === 'object' && (
                    <img
                      src={URL.createObjectURL(formData.profilePhoto)}
                      alt="Preview"
                      className="photo-preview"
                    />
                  )}
                  {formData.profilePhoto === 'existing' && (
                    <p style={{ color: '#0066CC', fontSize: '14px', marginTop: '10px' }}>
                      Previous profile photo is already uploaded
                    </p>
                  )}
                  {errors.profilePhoto && <span className="error-message">{errors.profilePhoto}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">About Me (Max 500 characters)</label>
                  <textarea
                    className={`form-control ${errors.aboutMe ? 'error' : ''}`}
                    rows="6"
                    maxLength="500"
                    placeholder="Tell us about yourself, your skills, interests, and what excites you about joining Winwire..."
                    value={formData.aboutMe}
                    onChange={(e) => {
                      setFormData({ ...formData, aboutMe: e.target.value });
                      setErrors({ ...errors, aboutMe: '' });
                    }}
                  />
                  <div className="char-count">
                    {formData.aboutMe.length}/500 characters
                  </div>
                  {errors.aboutMe && <span className="error-message">{errors.aboutMe}</span>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-actions">
              {activeTab !== 'personal' && (
                <button
                  type="button"
                  className="btn-nav btn-prev"
                  onClick={goToPreviousTab}
                >
                  ← Previous
                </button>
              )}
              {activeTab !== 'profile' && (
                <button
                  type="button"
                  className="btn-nav btn-next"
                  onClick={goToNextTab}
                >
                  Next →
                </button>
              )}
              {activeTab === 'profile' && (
                <button
                  type="submit"
                  className="btn-nav btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner spinner-small"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSave /> Submit Onboarding
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
    );
  }

  // Fallback (should not reach here under normal circumstances)
  return (
    <div className="onboarding-page">
      <div className="status-container">
        <div className="status-card fade-in">
          <p>Unable to determine onboarding status. Please refresh the page.</p>
          <button onClick={handleLogout} className="btn btn-secondary">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
