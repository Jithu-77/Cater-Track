import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Login from './pages/Login';
import Registration from './pages/Registration';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import NotificationCenter from './pages/NotificationCenter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';

// Simple auth check (checks for token in localStorage)
const isAuthenticated = () => !!localStorage.getItem('token');

// Protected route component
function PrivateRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
}

function App() {
  return (
    <DataProvider>
      <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<><Navbar /><Outlet /></>}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/staff-dashboard" element={<StaffDashboard />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/notifications" element={<NotificationCenter />} />
           
           
          </Route>
        </Route>

        {/* Redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        pauseOnHover
      />
      </Router>
    </DataProvider>
    
  );
}

export default App;
