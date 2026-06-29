import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AIInventoryDashboard.css';

function AIInventoryDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchInventoryStatus();
    fetchAIStatus();
    
    // Set up auto-refresh every 2 minutes
    const interval = setInterval(() => {
      fetchNotifications();
      fetchInventoryStatus();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/notifications?type=inventory_alert&unreadOnly=false');
      setNotifications(response.data.slice(0, 10)); // Show latest 10 notifications
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    }
  };

  const fetchInventoryStatus = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/inventory');
      if (response.data.success) {
        const items = response.data.data;
        const lowStockItems = items.filter(item => item.quantity <= item.minThreshold);
        const outOfStockItems = items.filter(item => item.quantity === 0);
        
        setInventoryStatus({
          totalItems: items.length,
          lowStockItems: lowStockItems.length,
          outOfStockItems: outOfStockItems.length,
          items: items
        });
      }
    } catch (err) {
      console.error('Error fetching inventory status:', err);
    }
  };

  const fetchAIStatus = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/inventory/ai-status');
      if (response.data.success) {
        setAiStatus(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching AI status:', err);
    }
  };

  const triggerAICheck = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/inventory/ai-check');
      if (response.data.success) {
        alert('AI inventory check completed successfully!');
        fetchNotifications();
        fetchInventoryStatus();
      }
    } catch (err) {
      console.error('Error triggering AI check:', err);
      alert('Failed to trigger AI check');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:4000/api/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#3b82f6',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="ai-inventory-dashboard">
      <div className="dashboard-header">
        <h2>🤖 AI Inventory Management</h2>
        <button 
          className="ai-check-btn" 
          onClick={triggerAICheck}
          disabled={loading}
        >
          {loading ? '🔄 Checking...' : '🔍 Run AI Check'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* AI Status */}
      {aiStatus && (
        <div className="ai-status-section">
          <h3>AI Monitor Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className={`status-value ${aiStatus.isRunning ? 'running' : 'stopped'}`}>
                {aiStatus.isRunning ? '🟢 Running' : '🔴 Stopped'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Check Interval:</span>
              <span className="status-value">{aiStatus.checkInterval} minutes</span>
            </div>
            <div className="status-item">
              <span className="status-label">Active Monitors:</span>
              <span className="status-value">{aiStatus.activeItems}</span>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Overview */}
      {inventoryStatus && (
        <div className="inventory-overview">
          <h3>Inventory Overview</h3>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <h4>{inventoryStatus.totalItems}</h4>
                <p>Total Items</p>
              </div>
            </div>
            <div className="overview-card alert">
              <div className="card-icon">⚠️</div>
              <div className="card-content">
                <h4>{inventoryStatus.lowStockItems}</h4>
                <p>Low Stock</p>
              </div>
            </div>
            <div className="overview-card critical">
              <div className="card-icon">🚨</div>
              <div className="card-content">
                <h4>{inventoryStatus.outOfStockItems}</h4>
                <p>Out of Stock</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Notifications */}
      <div className="notifications-section">
        <h3>AI Generated Alerts</h3>
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <span className="no-notifications-icon">✅</span>
            <p>No inventory alerts at the moment</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`notification-card ${notification.priority}`}
                onClick={() => markNotificationAsRead(notification._id)}
              >
                <div className="notification-header">
                  <div className="notification-title">
                    <span className="notification-icon">
                      {notification.aiGenerated ? '🤖' : '📢'}
                    </span>
                    {notification.title}
                  </div>
                  <div className="notification-meta">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    >
                      {notification.priority.toUpperCase()}
                    </span>
                    <span className="time-ago">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                {notification.aiInsights && (
                  <div className="ai-insights">
                    <div className="insight-item">
                      <strong>AI Confidence:</strong> {Math.round(notification.aiInsights.confidence * 100)}%
                    </div>
                    <div className="insight-item">
                      <strong>Reasoning:</strong> {notification.aiInsights.reasoning}
                    </div>
                    {notification.aiInsights.suggestedActions && (
                      <div className="suggested-actions">
                        <strong>Suggested Actions:</strong>
                        <ul>
                          {notification.aiInsights.suggestedActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {notification.actionRequired && (
                  <div className="notification-actions">
                    <button className="action-btn primary">
                      {notification.actionText || 'Take Action'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Critical Items List */}
      {inventoryStatus && inventoryStatus.items && (
        <div className="critical-items-section">
          <h3>Items Requiring Attention</h3>
          <div className="critical-items-list">
            {inventoryStatus.items
              .filter(item => item.quantity <= item.minThreshold)
              .map((item) => (
                <div key={item._id} className="critical-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.category} • {item.quantity} {item.unit} remaining</p>
                  </div>
                  <div className="item-status">
                    <span className={`stock-level ${item.quantity === 0 ? 'out-of-stock' : 'low-stock'}`}>
                      {item.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                    </span>
                    <span className="threshold">
                      Min: {item.minThreshold} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIInventoryDashboard;
