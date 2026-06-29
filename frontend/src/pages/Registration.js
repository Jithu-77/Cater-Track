import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Registration.css';

function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setSuccess('Registration successful! You can now login.');
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoUser = async (role) => {
    setIsLoading(true);
    setError('');

    const demoUsers = {
      admin: {
        name: 'Admin User',
        email: 'admin@catering.com',
        password: 'admin123',
        role: 'admin'
      },
      staff: {
        name: 'Staff Member',
        email: 'staff@catering.com',
        password: 'staff123',
        role: 'staff'
      },
      customer: {
        name: 'Customer User',
        email: 'customer@catering.com',
        password: 'customer123',
        role: 'customer'
      }
    };

    try {
      const userData = demoUsers[role];
      await axios.post('http://localhost:4000/api/auth/register', userData);
      setSuccess(`Demo ${role} user created successfully!`);
    } catch (error) {
      if (error.response?.data?.msg?.includes('already exists')) {
        setSuccess(`Demo ${role} user already exists!`);
      } else {
        setError(`Failed to create demo ${role} user.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-background">
        <div className="registration-card">
          <div className="registration-header">
            <div className="logo">
              <div className="logo-icon">🍽️</div>
            </div>
            <h1 className="registration-title">Create Account</h1>
            <p className="registration-subtitle">Join our catering system today!</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="message success-message">
              <span className="message-icon">✅</span>
              {success}
            </div>
          )}
          {error && (
            <div className="message error-message">
              <span className="message-icon">❌</span>
              {error}
            </div>
          )}

          {/* Demo Users Creation */}
          <div className="demo-creation-section">
            <h3 className="demo-title">Create Demo Users</h3>
            <div className="demo-buttons">
              <button
                type="button"
                className="demo-btn admin"
                onClick={() => createDemoUser('admin')}
                disabled={isLoading}
              >
                👑 Create Admin
              </button>
              <button
                type="button"
                className="demo-btn staff"
                onClick={() => createDemoUser('staff')}
                disabled={isLoading}
              >
                👨‍🍳 Create Staff
              </button>
              <button
                type="button"
                className="demo-btn customer"
                onClick={() => createDemoUser('customer')}
                disabled={isLoading}
              >
                👤 Create Customer
              </button>
            </div>
          </div>

          <div className="divider">
            <span className="divider-text">OR</span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <div className="input-container">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder=" "
                  />
                  <label className="form-label">Full Name</label>
                  <div className="input-icon">👤</div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-container">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder=" "
                  />
                  <label className="form-label">Email Address</label>
                  <div className="input-icon">📧</div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder=" "
                  />
                  <label className="form-label">Password</label>
                  <div className="input-icon">🔒</div>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <div className="input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder=" "
                  />
                  <label className="form-label">Confirm Password</label>
                  <div className="input-icon">🔒</div>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label className="role-label">Select Role</label>
              <div className="role-selection">
                <div className="role-options">
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={formData.role === 'customer'}
                      onChange={handleChange}
                    />
                    <span className="role-content">
                      <span className="role-icon">👤</span>
                      <span className="role-text">Customer</span>
                    </span>
                  </label>
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="staff"
                      checked={formData.role === 'staff'}
                      onChange={handleChange}
                    />
                    <span className="role-content">
                      <span className="role-icon">👨‍🍳</span>
                      <span className="role-text">Staff</span>
                    </span>
                  </label>
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={handleChange}
                    />
                    <span className="role-content">
                      <span className="role-icon">👑</span>
                      <span className="role-text">Admin</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className={`register-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="registration-footer">
            <p>Already have an account? <Link to="/" className="login-link">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
