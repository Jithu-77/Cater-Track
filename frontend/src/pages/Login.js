import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });

      // Store token and user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Route based on user role
      const userRole = res.data.user.role;
      switch (userRole) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'staff':
          navigate('/staff-dashboard');
          break;
        case 'customer':
          navigate('/customer-dashboard');
          break;
        default:
          navigate('/customer-dashboard'); // Default fallback
      }
    } catch (error) {
      setError(error.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">🍽️</div>
            </div>
            <p className="login-subtitle">Welcome back! Please sign in to your account.</p>
          </div>





          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-icon">📧</div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-icon">🔒</div>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <button type="button" className="forgot-password" onClick={() => alert('Password reset functionality coming soon!')}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register" className="signup-link">Sign up here</Link></p>
            <p>Or create demo users on the <Link to="/register" className="signup-link">registration page</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
