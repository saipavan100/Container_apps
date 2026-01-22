import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Login from './components/Login';
import HRDashboard from './components/HR/HRDashboard';
import CreateCandidate from './components/HR/CreateCandidate';
import ViewSubmissions from './components/HR/ViewSubmissions';
import SubmissionDetails from './components/HR/SubmissionDetails';
import OnboardingForm from './components/Employee/OnboardingForm';
import AcceptOffer from './components/AcceptOffer';
import AcceptOnboardingPass from './components/AcceptOnboardingPass';
import PrivateRoute from './components/PrivateRoute';
import EmployeeWelcome from './components/EmployeeWelcome';
import LearningMaterials from './components/LearningMaterials';

function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/accept-offer/:token" element={<AcceptOffer />} />
          <Route path="/accept-onboarding-pass/:token" element={<AcceptOnboardingPass />} />
          
          {/* HR Routes - NO Chatbot */}
          <Route 
            path="/hr/dashboard" 
            element={
              <PrivateRoute role="HR">
                <HRDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/hr/create-candidate" 
            element={
              <PrivateRoute role="HR">
                <CreateCandidate />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/hr/submissions" 
            element={
              <PrivateRoute role="HR">
                <ViewSubmissions />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/hr/submissions/:id" 
            element={
              <PrivateRoute role="HR">
                <SubmissionDetails />
              </PrivateRoute>
            } 
          />
          
          {/* Employee Routes - WITH Chatbot */}
          <Route 
            path="/employee/welcome" 
            element={
              <PrivateRoute role="EMPLOYEE">
                <EmployeeWelcome />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/learning-materials" 
            element={
              <PrivateRoute role="EMPLOYEE">
                <LearningMaterials />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employee/onboarding" 
            element={
              <PrivateRoute role="EMPLOYEE">
                <OnboardingForm />
              </PrivateRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
