import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeWelcome.css';
import EmployeeChatbot from './EmployeeChatbot';

function EmployeeWelcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      // User data is retrieved but not needed in state
      // userData is available from localStorage when needed
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleStartOnboarding = () => {
    navigate('/employee/onboarding');
  };

  if (loading) {
    return <div className="welcome-loading">Loading...</div>;
  }

  return (
    <div className="employee-welcome-container">
      {/* Header */}
      <header className="welcome-header">
        <div className="welcome-header-content">
          <div className="header-left">
            <div className="welcome-logo">
              <span className="logo-box"><span className="win-text">Win</span><span className="wire-text">Wire</span></span>
            </div>
            <div className="header-title">
              <h1>Winwire HR Portal</h1>
              <p>Employee Onboarding Management</p>
            </div>
          </div>
          <div className="welcome-user-info">
            <button className="welcome-logout-btn" onClick={handleLogout}>
              ⬅ Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="welcome-main">
        <div className="welcome-left">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-greeting">
              <h2>👋 Welcome to WinWire!</h2>
              <p>We're excited to have you on board. Let's get you started!</p>
            </div>

            {/* Quick Actions */}
            <div className="welcome-actions">
              <div className="action-card" onClick={handleStartOnboarding}>
                <div className="action-icon">📝</div>
                <div className="action-content">
                  <h3>Start Onboarding</h3>
                  <p>Complete your onboarding form</p>
                </div>
                <div className="action-arrow">→</div>
              </div>

              <div className="action-card" onClick={() => navigate('/learning-materials')}>
                <div className="action-icon">📚</div>
                <div className="action-content">
                  <h3>Learning Materials</h3>
                  <p>View training resources</p>
                </div>
                <div className="action-arrow">→</div>
              </div>

              <div className="action-card">
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h3>Company Info</h3>
                  <p>Learn about WinWire</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="welcome-info-grid">
              <div className="info-card">
                <h4>📚 Getting Started</h4>
                <ul>
                  <li>Complete your onboarding form</li>
                  <li>Review company policies</li>
                  <li>Set up your account</li>
                </ul>
              </div>

              <div className="info-card">
                <h4>🤝 Support</h4>
                <ul>
                  <li>Chat with HR Assistant →</li>
                  <li>Email: hr@winwire.com</li>
                  <li>Available 9AM-5PM EST</li>
                </ul>
              </div>

              <div className="info-card">
                <h4>🎯 Next Steps</h4>
                <ul>
                  <li>Complete onboarding</li>
                  <li>Receive your welcome kit</li>
                  <li>Start your first day</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
          </section>
        </div>

        {/* Right Panel - Chatbot */}
        <div className="welcome-right">
          <div className="chatbot-panel">
            <EmployeeChatbot />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeWelcome;
