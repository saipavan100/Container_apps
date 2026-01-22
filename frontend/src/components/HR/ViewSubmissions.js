import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import { formatDate } from '../../utils/validation';
import './ViewSubmissions.css';

const ViewSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/admin/submissions');
      setSubmissions(response.data.submissions);
    } catch (error) {
      toast.error('Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'ALL') return true;
    return sub.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="view-submissions-page">
      <div className="page-header">
        <div className="container">
          <Link to="/hr/dashboard" className="back-link">
            <FiArrowLeft /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="submissions-container fade-in">
          <div className="submissions-header">
            <div>
              <h1>Onboarding Submissions</h1>
              <p className="subtitle">Review and manage employee onboarding submissions</p>
            </div>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All ({submissions.length})
              </button>
              <button
                className={`filter-btn ${filter === 'SUBMITTED' ? 'active' : ''}`}
                onClick={() => setFilter('SUBMITTED')}
              >
                Pending ({submissions.filter(s => s.status === 'SUBMITTED').length})
              </button>
              <button
                className={`filter-btn ${filter === 'PASS_SENT' ? 'active' : ''}`}
                onClick={() => setFilter('PASS_SENT')}
              >
                Pass Sent ({submissions.filter(s => s.status === 'PASS_SENT').length})
              </button>
              <button
                className={`filter-btn ${filter === 'PASS_ACCEPTED' ? 'active' : ''}`}
                onClick={() => setFilter('PASS_ACCEPTED')}
              >
                Activated ({submissions.filter(s => s.status === 'PASS_ACCEPTED').length})
              </button>
              <button
                className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
                onClick={() => setFilter('REJECTED')}
              >
                Rejected ({submissions.filter(s => s.status === 'REJECTED').length})
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Experience</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission._id}>
                      <td><strong>{submission.fullName}</strong></td>
                      <td>{submission.email}</td>
                      <td>
                        <span className="badge badge-primary">{submission.department}</span>
                      </td>
                      <td>{submission.totalExperience} years</td>
                      <td>{formatDate(submission.createdAt)}</td>
                      <td>
                        <span className={`badge ${
                          submission.status === 'PASS_ACCEPTED' ? 'badge-success' :
                          submission.status === 'PASS_SENT' ? 'badge-info' :
                          submission.status === 'REJECTED' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {submission.status === 'PASS_SENT' ? 'Pass Sent' :
                           submission.status === 'PASS_ACCEPTED' ? 'Activated' :
                           submission.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/hr/submissions/${submission._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          <FiEye /> View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissions;
