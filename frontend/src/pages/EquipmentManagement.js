import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EquipmentManagement.css';

function EquipmentManagement() {
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [maintenanceRecommendations, setMaintenanceRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'kitchen',
    location: '',
    specifications: {
      dimensions: '',
      weight: '',
      powerRequirement: '',
      features: []
    }
  });

  const [bookingData, setBookingData] = useState({
    bookedBy: '',
    startDate: '',
    endDate: '',
    purpose: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/equipment');
      setEquipment(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch equipment');
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/equipment', newEquipment);
      setShowAddModal(false);
      setNewEquipment({
        name: '',
        type: 'kitchen',
        location: '',
        specifications: { dimensions: '', weight: '', powerRequirement: '', features: [] }
      });
      fetchEquipment();
    } catch (err) {
      setError('Failed to add equipment');
    }
  };

  const handleBookEquipment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:4000/api/equipment/${selectedEquipment._id}/book`, bookingData);
      setShowBookingModal(false);
      setBookingData({ bookedBy: '', startDate: '', endDate: '', purpose: '' });
      fetchEquipment();
    } catch (err) {
      setError('Failed to book equipment');
    }
  };

  const fetchAnalytics = async (equipmentId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/equipment/${equipmentId}/analytics`);
      setAnalytics(response.data);
      setShowAnalytics(true);
    } catch (err) {
      setError('Failed to fetch analytics');
    }
  };

  const fetchMaintenanceRecommendations = async (equipmentId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/equipment/${equipmentId}/maintenance-recommendations`);
      setMaintenanceRecommendations(response.data);
    } catch (err) {
      setError('Failed to fetch maintenance recommendations');
    }
  };

  const generateMaintenanceAlert = async (equipmentId) => {
    try {
      await axios.post(`http://localhost:4000/api/equipment/${equipmentId}/generate-alert`);
      alert('Maintenance alert generated successfully!');
    } catch (err) {
      setError('Failed to generate maintenance alert');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'booked': return '#FF9800';
      case 'maintenance': return '#F44336';
      case 'damaged': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getUtilizationColor = (rate) => {
    if (rate >= 80) return '#F44336';
    if (rate >= 60) return '#FF9800';
    if (rate >= 40) return '#4CAF50';
    return '#2196F3';
  };

  if (loading) return <div className="loading">Loading equipment...</div>;

  return (
    <div className="equipment-management">
      <div className="equipment-header">
        <h1>🔧 Equipment Management</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ Add Equipment
          </button>
          <button className="btn-secondary" onClick={fetchEquipment}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="equipment-grid">
        {equipment.map((item) => (
          <div key={item._id} className="equipment-card">
            <div className="equipment-header-card">
              <h3>{item.name}</h3>
              <span 
                className="status-badge" 
                style={{ backgroundColor: getStatusColor(item.status) }}
              >
                {item.status}
              </span>
            </div>

            <div className="equipment-details">
              <p><strong>Type:</strong> {item.type}</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Quantity:</strong> {item.quantity || 1}</p>
            </div>

            <div className="ai-insights">
              <h4>🤖 AI Insights</h4>
              <div className="utilization-bar">
                <span>Utilization: {item.utilizationRate || 0}%</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${item.utilizationRate || 0}%`,
                      backgroundColor: getUtilizationColor(item.utilizationRate || 0)
                    }}
                  ></div>
                </div>
              </div>
              
              {item.aiInsights?.recommendedMaintenance && (
                <div className="maintenance-alert">
                  ⚠️ Maintenance recommended: {new Date(item.aiInsights.recommendedMaintenance).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="equipment-actions">
              <button 
                className="btn-book"
                onClick={() => {
                  setSelectedEquipment(item);
                  setShowBookingModal(true);
                }}
                disabled={item.status !== 'available'}
              >
                📅 Book
              </button>
              <button 
                className="btn-analytics"
                onClick={() => fetchAnalytics(item._id)}
              >
                📊 Analytics
              </button>
              <button 
                className="btn-maintenance"
                onClick={() => fetchMaintenanceRecommendations(item._id)}
              >
                🔧 Maintenance
              </button>
              <button 
                className="btn-alert"
                onClick={() => generateMaintenanceAlert(item._id)}
              >
                🚨 Alert
              </button>
            </div>

            {item.bookingHistory && item.bookingHistory.length > 0 && (
              <div className="recent-bookings">
                <h5>Recent Bookings:</h5>
                {item.bookingHistory.slice(-2).map((booking, index) => (
                  <div key={index} className="booking-item">
                    <span>{booking.purpose}</span>
                    <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>📅 Book Equipment: {selectedEquipment?.name}</h2>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>✕</button>
            </div>
            <form onSubmit={handleBookEquipment}>
              <div className="form-group">
                <label>Booked By (User ID):</label>
                <input
                  type="text"
                  value={bookingData.bookedBy}
                  onChange={(e) => setBookingData({...bookingData, bookedBy: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Date:</label>
                <input
                  type="datetime-local"
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date:</label>
                <input
                  type="datetime-local"
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Purpose:</label>
                <input
                  type="text"
                  value={bookingData.purpose}
                  onChange={(e) => setBookingData({...bookingData, purpose: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Book Equipment</button>
                <button type="button" className="btn-secondary" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>➕ Add New Equipment</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddEquipment}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={newEquipment.type}
                  onChange={(e) => setNewEquipment({...newEquipment, type: e.target.value})}
                >
                  <option value="kitchen">Kitchen</option>
                  <option value="serving">Serving</option>
                  <option value="transport">Transport</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="storage">Storage</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  value={newEquipment.location}
                  onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Equipment</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="modal-overlay">
          <div className="modal analytics-modal">
            <div className="modal-header">
              <h2>📊 Equipment Analytics</h2>
              <button className="close-btn" onClick={() => setShowAnalytics(false)}>✕</button>
            </div>
            <div className="analytics-content">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Utilization Rate</h3>
                  <div className="big-number">{analytics.utilizationRate}%</div>
                </div>
                <div className="analytics-card">
                  <h3>Total Bookings</h3>
                  <div className="big-number">{analytics.totalBookings}</div>
                </div>
                <div className="analytics-card">
                  <h3>Revenue Generated</h3>
                  <div className="big-number">${analytics.revenueGenerated}</div>
                </div>
                <div className="analytics-card">
                  <h3>Cost Per Use</h3>
                  <div className="big-number">${analytics.costPerUse?.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Recommendations Modal */}
      {maintenanceRecommendations && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>🔧 Maintenance Recommendations</h2>
              <button className="close-btn" onClick={() => setMaintenanceRecommendations(null)}>✕</button>
            </div>
            <div className="maintenance-content">
              <div className="maintenance-score">
                <h3>Maintenance Priority: {maintenanceRecommendations.maintenanceScore}</h3>
                <p>Utilization Rate: {maintenanceRecommendations.utilizationRate}%</p>
              </div>
              <div className="suggested-actions">
                <h4>Suggested Actions:</h4>
                <ul>
                  {maintenanceRecommendations.suggestedActions?.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              <div className="cost-estimate">
                <p><strong>Estimated Cost:</strong> ${maintenanceRecommendations.estimatedCost}</p>
                <p><strong>Estimated Downtime:</strong> {maintenanceRecommendations.estimatedDowntime}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EquipmentManagement;
