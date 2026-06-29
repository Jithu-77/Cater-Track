import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'customer';

  // Role-based navigation items
  const getNavItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { path: '/admin-dashboard', label: 'Admin Dashboard', icon: '📊' },
          { path: '/notifications', label: 'Notifications', icon: '🔔' }
        ];
      case 'staff':
        return [
          { path: '/staff-dashboard', label: 'Staff Dashboard', icon: '📊' },
          { path: '/notifications', label: 'Notifications', icon: '🔔' }
        ];
      case 'customer':
        return [
          { path: '/customer-dashboard', label: 'My Dashboard', icon: '📊' },
          { path: '/notifications', label: 'Notifications', icon: '🔔' }
        ];
      default:
        return [
          { path: '/admin-dashboard', label: 'Dashboard', icon: '📊' },
          { path: '/notifications', label: 'Notifications', icon: '🔔' }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo Section */}
        <div className="navbar-brand">
          <div className="brand-icon">🍽️</div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-menu">
          <div className="navbar-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">{user.name || 'User'}</span>
              <span className="user-role">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
            </div>
          </div>

          <div className="user-actions">
            <Link className="notification-btn" to="/notifications" title="Notifications">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">3</span>
            </Link>

            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </Link>
          ))}

          <div className="mobile-user-section">
            <Link
              className="mobile-notification-btn"
              to="/notifications"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="notification-icon">🔔</span>
              <span className="nav-text">Notifications</span>
              <span className="notification-badge">3</span>
            </Link>

            <button className="mobile-logout-btn" onClick={handleLogout}>
              <span className="logout-icon">🚪</span>
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
