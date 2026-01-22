import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle, FiMail, FiUser } from 'react-icons/fi';
import api from '../utils/api';
import './AcceptOnboardingPass.css';

const AcceptOnboardingPass = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [submissionData, setSubmissionData] = useState(null);

  useEffect(() => {
    fetchOnboardingPassDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchOnboardingPassDetails = async () => {
    try {
      const response = await api.get(`/admin/onboarding-pass-details/${token}`);
      setSubmissionData(response.data.submission);
      setLoading(false);
    } catch (error) {
      setError('Invalid or expired onboarding pass link');
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (accepting) return;

    setAccepting(true);
    try {
      await api.post(`/admin/accept-onboarding-pass/${token}`);

      setAccepted(true);
      toast.success('Congratulations! Your employee account has been activated!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error accepting onboarding pass');
      setError(error.response?.data?.message || 'Failed to accept onboarding pass');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="accept-page">
        <div className="accept-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error && !accepted) {
    return (
      <div className="accept-page">
        <div className="accept-container">
          <div className="error-icon">
            <FiXCircle />
          </div>
          <h1>Invalid Link</h1>
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="accept-page">
        <div className="accept-container success-container">
          <div className="success-icon">
            <FiCheckCircle />
          </div>
          <h1>🎉 Welcome to WinWire!</h1>
          <p className="success-message">
            Your employee account has been successfully activated!
          </p>
          <div className="info-box">
            <h3>What's Next?</h3>
            <ul className="next-steps">
              <li>✓ Your Employee ID has been generated</li>
              <li>✓ You will receive 5 onboarding emails with important information on joining date. Do not Panic Hr Team will explain</li>
            </ul>
          </div>
          <p className="redirect-message">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-page">
      <div className="accept-container">
        <div className="winwire-logo-page">
          <span className="logo-win">Win</span><span className="logo-wire">Wire</span>
        </div>

        <h1>Onboarding Pass Approved!</h1>
        <p className="subtitle">Welcome to WinWire Technologies</p>

        <div className="info-box">
          <h3>🎊 Congratulations!</h3>
          <p>
            Your onboarding documents have been reviewed and approved by our HR team.
            You're one step away from officially joining the WinWire family!
            {submissionData?.dateOfJoining && (
              <div style={{ marginTop: '20px', padding: '15px', background: '#E8F4FD', borderRadius: '8px', border: '2px solid #0066CC' }}>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#0066CC', margin: '0' }}>
                  🎉 You will be joining us on {new Date(submissionData.dateOfJoining).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}!
                </p>
                <p style={{ fontSize: '16px', color: '#000', margin: '10px 0 0 0' }}>Welcome to Winwire!</p>
              </div>
            )}
          </p>
        </div>

        <div className="details-card">
          <h3>What happens when you accept?</h3>
          <ul className="benefits-list">
            <li>
              <FiUser className="icon" />
              <div>
                <strong>Employee Account Creation</strong>
                <p>Your official employee account will be created with a unique Employee ID</p>
              </div>
            </li>
            <li>
              <FiMail className="icon" />
              <div>
                <strong>Onboarding Emails</strong>
                <p>You'll receive 5 important emails with company policies, guidelines, and resources</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="action-section">
          <p className="action-note">
            By accepting this onboarding pass, you confirm that all the information you provided is accurate.
          </p>
          <button
            onClick={handleAccept}
            className="btn btn-success btn-lg"
            disabled={accepting}
          >
            {accepting ? (
              <>
                <div className="spinner spinner-small"></div>
                Processing...
              </>
            ) : (
              <>
                <FiCheckCircle /> Accept & Activate My Account
              </>
            )}
          </button>
        </div>

        <div className="footer-note">
          <p>
            If you believe this is a mistake or have any questions, please contact our HR team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcceptOnboardingPass;
