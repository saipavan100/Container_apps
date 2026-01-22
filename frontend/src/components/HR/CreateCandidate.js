import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUpload } from 'react-icons/fi';
import api from '../../utils/api';
import { validateEmail, validatePhone, validateFile } from '../../utils/validation';
import './CreateCandidate.css';

const CreateCandidate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    department: ''
  });
  const [offerLetter, setOfferLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateFile(file, ['pdf'], 5);
      if (!validation.valid) {
        toast.error(validation.error);
        e.target.value = '';
        return;
      }
      setOfferLetter(file);
      setErrors({ ...errors, offerLetter: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Valid 10-digit phone number is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!offerLetter) newErrors.offerLetter = 'Offer letter PDF is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix all validation errors');
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('position', formData.position);
    formDataToSend.append('department', formData.department);
    formDataToSend.append('offerLetter', offerLetter);

    try {
      await api.post('/candidates', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Candidate created and offer email sent successfully!');
      navigate('/hr/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-candidate-page">
      <div className="page-header">
        <div className="container">
          <Link to="/hr/dashboard" className="back-link">
            <FiArrowLeft /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="create-candidate-card fade-in">
          <h1>Create New Candidate</h1>
          <p className="subtitle">Upload offer letter and send to candidate</p>

          <form onSubmit={handleSubmit} className="candidate-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label required">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`form-control ${errors.fullName ? 'error' : ''}`}
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label required">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label required">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`form-control ${errors.phone ? 'error' : ''}`}
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="position" className="form-label required">Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  className={`form-control ${errors.position ? 'error' : ''}`}
                  placeholder="e.g., Software Engineer"
                  value={formData.position}
                  onChange={handleChange}
                />
                {errors.position && <span className="error-message">{errors.position}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department" className="form-label required">Department/Practice</label>
                <select
                  id="department"
                  name="department"
                  className={`form-control ${errors.department ? 'error' : ''}`}
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cloud Solutions">Cloud Solutions</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Product Management">Product Management</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
                {errors.department && <span className="error-message">{errors.department}</span>}
              </div>
            </div>

            <div className="form-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="offerLetter" className="form-label required">Offer Letter (PDF only)</label>
                <div className={`file-upload ${offerLetter ? 'active' : ''} ${errors.offerLetter ? 'error' : ''}`}>
                  <input
                    type="file"
                    id="offerLetter"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="offerLetter">
                    <FiUpload size={32} />
                    <p>{offerLetter ? offerLetter.name : 'Click to upload offer letter (PDF, Max 5MB)'}</p>
                  </label>
                </div>
                {errors.offerLetter && <span className="error-message">{errors.offerLetter}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/hr/dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner spinner-small"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiUpload /> Create & Send Offer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCandidate;
