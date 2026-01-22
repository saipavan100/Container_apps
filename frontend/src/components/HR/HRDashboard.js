import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUsers, FiUserCheck, FiFileText, FiUserPlus, FiLogOut, FiPlusCircle, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import WinWireChat from '../WinWireChat';
import EmployeeChatbot from '../EmployeeChatbot';
import './HRDashboard.css';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, candidatesRes, employeesRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/candidates'),
        api.get('/employees/active')
      ]);

      setStats(statsRes.data.stats);
      setCandidates(candidatesRes.data.candidates);
      setEmployees(employeesRes.data.employees || []);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerJoining = async (candidateId) => {
    if (!window.confirm('Are you sure you want to trigger joining process?')) {
      return;
    }

    try {
      await api.post(`/candidates/${candidateId}/trigger-joining`);
      toast.success('Joining process triggered successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error triggering joining process');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="hr-dashboard">
      {/* Header */}
      <header className="dashboard-header fade-in">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="winwire-logo-small">
                <span className="logo-win-small">Win</span><span className="logo-wire-small">Wire</span>
              </div>
              <div>
                <h1>Winwire HR Portal</h1>
                <p>Employee Onboarding Management</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid fade-in-up">
          <div className="stat-card stat-primary">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-info">
              <h3>{stats.totalCandidates || 0}</h3>
              <p>Total Candidates</p>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">
              <FiUserCheck />
            </div>
            <div className="stat-info">
              <h3>{stats.acceptedOffers || 0}</h3>
              <p>Accepted Offers</p>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon">
              <FiFileText />
            </div>
            <div className="stat-info">
              <h3>{stats.pendingSubmissions || 0}</h3>
              <p>Pending Reviews</p>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">
              <FiUserPlus />
            </div>
            <div className="stat-info">
              <h3>{stats.activeEmployees || 0}</h3>
              <p>Active Employees</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions fade-in-up">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/hr/create-candidate" className="btn btn-primary">
              <FiPlusCircle /> Create New Candidate
            </Link>
            <Link to="/hr/submissions" className="btn btn-primary">
              <FiEye /> View All Submissions
            </Link>
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="candidates-section fade-in-up">
          <h2>Recent Candidates</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Offer Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      No candidates found. Create your first candidate!
                    </td>
                  </tr>
                ) : (
                  candidates.slice(0, 10).map((candidate) => (
                    <tr key={candidate._id}>
                      <td>{candidate.fullName}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.position}</td>
                      <td>
                        <span className="badge badge-info">{candidate.department}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          candidate.offerStatus === 'ACCEPTED' ? 'badge-success' :
                          candidate.offerStatus === 'REJECTED' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {candidate.offerStatus}
                        </span>
                      </td>
                      <td>
                        {candidate.offerStatus === 'ACCEPTED' && !candidate.joiningTriggered && (
                          <button
                            onClick={() => handleTriggerJoining(candidate._id)}
                            className="btn btn-success btn-sm"
                          >
                            Trigger Joining
                          </button>
                        )}
                        {candidate.joiningTriggered && (
                          <span className="badge badge-success">Joining Sent</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Employees */}
        <div className="employees-section fade-in-up">
          <h2>Active Employees ({employees.length})</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      No active employees yet
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee._id}>
                      <td><strong>{employee.employeeId}</strong></td>
                      <td>{employee.fullName}</td>
                      <td>{employee.email}</td>
                      <td><span className="badge badge-info">{employee.department}</span></td>
                      <td>{employee.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${employee.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Company Info Chatbot for HR */}
      <EmployeeChatbot />
      
      {/* Database Query Chatbot for HR */}
      <WinWireChat />
    </div>
  );
};

export default HRDashboard;
