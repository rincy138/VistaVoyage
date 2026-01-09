import { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import MyBookings from './pages/MyBookings';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import SmartPlanner from './pages/SmartPlanner';
import PackingAssistant from './pages/PackingAssistant';
import ResetPassword from './pages/ResetPassword';
import TravelOffers from './pages/TravelOffers';
import Hotels from './pages/Hotels';
import Taxis from './pages/Taxis';
import { AlertTriangle, Phone, Activity } from 'lucide-react';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  console.log("ProtectedRoute: User=", user, "Loading=", loading, "Allowed=", allowedRoles);

  if (loading) return <div style={{ color: 'white', padding: '100px', fontSize: '24px' }}>Loading authentication...</div>;

  if (!user) {
    console.log("Redirecting to login");
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("Redirecting to / due to role mismatch. User Role:", user.role);
    return (
      <div style={{ color: 'red', padding: '100px', fontSize: '24px', background: 'white', zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
        ACCESS DENIED. <br />
        Required: {JSON.stringify(allowedRoles)} <br />
        Current: {user.role} <br />
        Email: {user.email}
        <br />
        <button onClick={() => window.location.href = '/'}>Go Home</button>
      </div>
    );
  }

  return children;
};

const App = () => {
  const [showEmergency, setShowEmergency] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Home & Destinations */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/destinations" element={
                <ProtectedRoute>
                  <Destinations />
                </ProtectedRoute>
              } />
              <Route path="/destinations/:name" element={
                <ProtectedRoute>
                  <DestinationDetails />
                </ProtectedRoute>
              } />
              <Route path="/smart-planner" element={
                <ProtectedRoute>
                  <SmartPlanner />
                </ProtectedRoute>
              } />
              <Route path="/packing-assistant" element={
                <ProtectedRoute>
                  <PackingAssistant />
                </ProtectedRoute>
              } />

              {/* Packages */}
              <Route path="/packages" element={
                <ProtectedRoute>
                  <Packages />
                </ProtectedRoute>
              } />
              <Route path="/packages/:id" element={
                <ProtectedRoute>
                  <PackageDetails />
                </ProtectedRoute>
              } />

              {/* User Features */}
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } />

              {/* Service Pages */}
              <Route path="/travel-offers" element={
                <ProtectedRoute>
                  <TravelOffers />
                </ProtectedRoute>
              } />
              <Route path="/hotels" element={
                <ProtectedRoute>
                  <Hotels />
                </ProtectedRoute>
              } />
              <Route path="/taxis" element={
                <ProtectedRoute>
                  <Taxis />
                </ProtectedRoute>
              } />

              {/* Admin & Agent Dashboards */}
              <Route path="/agent/*" element={
                <ProtectedRoute allowedRoles={['Agent']}>
                  <AgentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>

          {/* Global Emergency Help Button */}
          <button
            className="emergency-fab"
            onClick={() => setShowEmergency(true)}
            title="Emergency Assistance"
          >
            <AlertTriangle size={24} />
            <span>Help</span>
          </button>

          {showEmergency && (
            <div className="emergency-modal-overlay" onClick={() => setShowEmergency(false)}>
              <div className="emergency-modal" onClick={e => e.stopPropagation()}>
                <div className="emergency-header">
                  <AlertTriangle color="var(--secondary)" size={32} />
                  <h3>Emergency Assistance</h3>
                </div>
                <div className="emergency-content">
                  <div className="emergency-item">
                    <Phone size={20} />
                    <div>
                      <strong>Police Control Room</strong>
                      <p>100 / 112</p>
                    </div>
                  </div>
                  <div className="emergency-item">
                    <Activity size={20} />
                    <div>
                      <strong>Ambulance Service</strong>
                      <p>102 / 108</p>
                    </div>
                  </div>
                  <p className="emergency-note">For destination-specific help, please check the "Emergency Contacts" section on the place's detail page.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => setShowEmergency(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
