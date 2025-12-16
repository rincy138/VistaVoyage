import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Packages from './pages/Packages';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/destinations" element={
            <ProtectedRoute>
              <div style={{ paddingTop: '80px' }}>Destinations</div>
            </ProtectedRoute>
          } />
          <Route path="/packages" element={
            <ProtectedRoute>
              <Packages />
            </ProtectedRoute>
          } />

          {/* Protected Routes */}
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
      </Router>
    </AuthProvider>
  )
}

export default App;
