import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../utils/api';
import './AcceptOffer.css';

const AcceptOffer = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(false);
  const [candidate, setCandidate] = useState(null);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/candidates/accept-offer/${token}`);
      setCandidate(response.data.candidate);
      setAccepted(true);
      toast.success('Offer accepted successfully!');
    } catch (error) {
      setError(true);
      toast.error(error.response?.data?.message || 'Error accepting offer');
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <div className="accept-offer-container">
        <div className="accept-offer-card fade-in">
          <div className="success-icon">
            <FiCheckCircle size={80} color="#4caf50" />
          </div>
          <h1>Offer Accepted Successfully!</h1>
          <p className="success-message">
            Congratulations, <strong>{candidate?.fullName}</strong>!
          </p>
          <p>
            You have successfully accepted the offer for the position of{' '}
            <strong>{candidate?.position}</strong> in the{' '}
            <strong>{candidate?.department}</strong> department.
          </p>
          <div className="info-box">
            <h3>What's Next?</h3>
            <ul>
              <li>HR will trigger your onboarding process</li>
              <li>You will receive login credentials via email</li>
              <li>Complete your joining formalities using the portal</li>
              <li>Upload required documents</li>
            </ul>
          </div>
          <p className="footer-note">
            Welcome to the Winwire family! 🎉
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="accept-offer-container">
        <div className="accept-offer-card fade-in">
          <div className="error-icon">
            <FiXCircle size={80} color="#f44336" />
          </div>
          <h1>Invalid or Expired Link</h1>
          <p>
            This offer acceptance link is either invalid or has expired.
            Please contact HR for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-offer-container">
      <div className="accept-offer-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <div className="accept-offer-card fade-in">
        <div className="logo-container">
          <div className="winwire-logo-page">
            <span className="logo-win">Win</span><span className="logo-wire">Wire</span>
          </div>
        </div>

        <h1>Congratulations!</h1>
        <p className="subtitle">
          You have received an offer from Winwire Technologies
        </p>

        <div className="offer-info">
          <p>
            Click the button below to accept your offer and begin your journey
            with us.
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="btn btn-primary btn-large"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner spinner-small"></div>
              Processing...
            </>
          ) : (
            <>
              <FiCheckCircle /> Accept Offer
            </>
          )}
        </button>

        <p className="note">
          By accepting this offer, you agree to join Winwire Technologies and
          complete the onboarding process.
        </p>
      </div>
    </div>
  );
};

export default AcceptOffer;
