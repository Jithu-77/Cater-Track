import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VehicleManagement.css';

function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [routeOptimization, setRouteOptimization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newVehicle, setNewVehicle] = useState({
    name: '',
    vehicleNumber: '',
    type: 'van',
    capacity: {
      weight: '',
      volume: '',
      passengers: ''
    },
    location: {
      base: {
        address: '',
        coordinates: { lat: '', lng: '' }
      }
    },
    specifications: {
      year: '',
      make: '',
      model: '',
      fuelType: 'petrol'
    }
  });

  const [bookingData, setBookingData] = useState({
    bookedBy: '',
    startDate: '',
    endDate: '',
    purpose: '',
    route: {
      start: '',
      end: '',
      distance: '',
      estimatedTime: ''
    }
  });

  const [routeData, setRouteData] = useState({
    destinations: ['']
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/vehicles');
      setVehicles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch vehicles');
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/vehicles', newVehicle);
      setShowAddModal(false);
      setNewVehicle({
        name: '',
        vehicleNumber: '',
        type: 'van',
        capacity: { weight: '', volume: '', passengers: '' },
        location: { base: { address: '', coordinates: { lat: '', lng: '' } } },
        specifications: { year: '', make: '', model: '', fuelType: 'petrol' }
      });
      fetchVehicles();
    } catch (err) {
      setError('Failed to add vehicle');
    }
  };

  const handleBookVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:4000/api/vehicles/${selectedVehicle._id}/book`, bookingData);
      setShowBookingModal(false);
      setBookingData({
        bookedBy: '',
        startDate: '',
        endDate: '',
        purpose: '',
        route: { start: '', end: '', distance: '', estimatedTime: '' }
      });
      fetchVehicles();
    } catch (err) {
      setError('Failed to book vehicle');
    }
  };

  const fetchAnalytics = async (vehicleId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/vehicles/${vehicleId}/analytics`);
      setAnalytics(response.data);
      setShowAnalytics(true);
    } catch (err) {
      setError('Failed to fetch analytics');
    }
  };

  const optimizeRoute = async (vehicleId) => {
    try {
      const response = await axios.post(`http://localhost:4000/api/vehicles/${vehicleId}/optimize-route`, {
        destinations: routeData.destinations.filter(dest => dest.trim() !== '')
      });
      setRouteOptimization(response.data);
    } catch (err) {
      setError('Failed to optimize route');
    }
  };

  const addDestination = () => {
    setRouteData({
      destinations: [...routeData.destinations, '']
    });
  };

  const updateDestination = (index, value) => {
    const newDestinations = [...routeData.destinations];
    newDestinations[index] = value;
    setRouteData({ destinations: newDestinations });
  };

  const removeDestination = (index) => {
    const newDestinations = routeData.destinations.filter((_, i) => i !== index);
    setRouteData({ destinations: newDestinations });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'booked': return '#FF9800';
      case 'maintenance': return '#F44336';
      case 'damaged': return '#9C27B0';
      case 'in-transit': return '#2196F3';
      default: return '#757575';
    }
  };

  const getFuelEfficiencyColor = (efficiency) => {
    if (efficiency >= 15) return '#4CAF50';
    if (efficiency >= 10) return '#FF9800';
    if (efficiency >= 5) return '#F44336';
    return '#757575';
  };

  if (loading) return <div className="loading">Loading vehicles...</div>;

  return (
    <div className="vehicle-management">
      <div className="vehicle-header">
        <h1>🚗 Vehicle Fleet Management</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ Add Vehicle
          </button>
          <button className="btn-secondary" onClick={fetchVehicles}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="vehicle-card">
            <div className="vehicle-header-card">
              <div>
                <h3>{vehicle.name}</h3>
                <p className="vehicle-number">{vehicle.vehicleNumber}</p>
              </div>
              <span 
                className="status-badge" 
                style={{ backgroundColor: getStatusColor(vehicle.status) }}
              >
                {vehicle.status}
              </span>
            </div>

            <div className="vehicle-details">
              <p><strong>Type:</strong> {vehicle.type}</p>
              <p><strong>Capacity:</strong> {vehicle.capacity?.weight}kg / {vehicle.capacity?.volume}m³</p>
              <p><strong>Base Location:</strong> {vehicle.location?.base?.address}</p>
              {vehicle.specifications && (
                <p><strong>Vehicle:</strong> {vehicle.specifications.year} {vehicle.specifications.make} {vehicle.specifications.model}</p>
              )}
            </div>

            <div className="ai-insights">
              <h4>🤖 AI Fleet Insights</h4>
              
              <div className="utilization-bar">
                <span>Utilization: {vehicle.utilizationRate || 0}%</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${vehicle.utilizationRate || 0}%`,
                      backgroundColor: vehicle.utilizationRate > 80 ? '#F44336' : 
                                     vehicle.utilizationRate > 60 ? '#FF9800' : '#4CAF50'
                    }}
                  ></div>
                </div>
              </div>

              <div className="fuel-efficiency">
                <span>Fuel Efficiency: {vehicle.fuelEfficiency || 0} km/L</span>
                <div className="efficiency-indicator" 
                     style={{ backgroundColor: getFuelEfficiencyColor(vehicle.fuelEfficiency || 0) }}>
                  {vehicle.fuelEfficiency > 15 ? '🟢 Excellent' : 
                   vehicle.fuelEfficiency > 10 ? '🟡 Good' : 
                   vehicle.fuelEfficiency > 5 ? '🟠 Fair' : '🔴 Poor'}
                </div>
              </div>

              {vehicle.aiInsights?.predictedBreakdown && (
                <div className="breakdown-alert">
                  ⚠️ Breakdown Risk: {vehicle.aiInsights.predictedBreakdown.probability * 100}% 
                  ({vehicle.aiInsights.predictedBreakdown.timeframe})
                </div>
              )}

              {vehicle.aiInsights?.costPerKm && (
                <div className="cost-info">
                  💰 Cost per km: ${vehicle.aiInsights.costPerKm.toFixed(2)}
                </div>
              )}
            </div>

            <div className="vehicle-actions">
              <button 
                className="btn-book"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowBookingModal(true);
                }}
                disabled={vehicle.status !== 'available'}
              >
                📅 Book
              </button>
              <button 
                className="btn-analytics"
                onClick={() => fetchAnalytics(vehicle._id)}
              >
                📊 Analytics
              </button>
              <button 
                className="btn-route"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowRouteOptimizer(true);
                }}
              >
                🗺️ Route
              </button>
              <button 
                className="btn-maintenance"
                onClick={() => alert('Maintenance scheduling feature coming soon!')}
              >
                🔧 Maintenance
              </button>
            </div>

            {vehicle.bookingHistory && vehicle.bookingHistory.length > 0 && (
              <div className="recent-trips">
                <h5>Recent Trips:</h5>
                {vehicle.bookingHistory.slice(-2).map((trip, index) => (
                  <div key={index} className="trip-item">
                    <span>{trip.purpose}</span>
                    <span>{trip.route?.distance || 'N/A'} km</span>
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
              <h2>📅 Book Vehicle: {selectedVehicle?.name}</h2>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>✕</button>
            </div>
            <form onSubmit={handleBookVehicle}>
              <div className="form-row">
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
                  <label>Purpose:</label>
                  <input
                    type="text"
                    value={bookingData.purpose}
                    onChange={(e) => setBookingData({...bookingData, purpose: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
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
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Location:</label>
                  <input
                    type="text"
                    value={bookingData.route.start}
                    onChange={(e) => setBookingData({
                      ...bookingData, 
                      route: {...bookingData.route, start: e.target.value}
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Location:</label>
                  <input
                    type="text"
                    value={bookingData.route.end}
                    onChange={(e) => setBookingData({
                      ...bookingData, 
                      route: {...bookingData.route, end: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Distance (km):</label>
                  <input
                    type="number"
                    value={bookingData.route.distance}
                    onChange={(e) => setBookingData({
                      ...bookingData, 
                      route: {...bookingData.route, distance: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Time (minutes):</label>
                  <input
                    type="number"
                    value={bookingData.route.estimatedTime}
                    onChange={(e) => setBookingData({
                      ...bookingData, 
                      route: {...bookingData.route, estimatedTime: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Book Vehicle</button>
                <button type="button" className="btn-secondary" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h2>➕ Add New Vehicle</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddVehicle}>
              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Name:</label>
                  <input
                    type="text"
                    value={newVehicle.name}
                    onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Number:</label>
                  <input
                    type="text"
                    value={newVehicle.vehicleNumber}
                    onChange={(e) => setNewVehicle({...newVehicle, vehicleNumber: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type:</label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  >
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                    <option value="car">Car</option>
                    <option value="refrigerated">Refrigerated</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Base Address:</label>
                  <input
                    type="text"
                    value={newVehicle.location.base.address}
                    onChange={(e) => setNewVehicle({
                      ...newVehicle, 
                      location: {
                        ...newVehicle.location,
                        base: {...newVehicle.location.base, address: e.target.value}
                      }
                    })}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Vehicle</button>
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
              <h2>📊 Vehicle Analytics</h2>
              <button className="close-btn" onClick={() => setShowAnalytics(false)}>✕</button>
            </div>
            <div className="analytics-content">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Utilization Rate</h3>
                  <div className="big-number">{analytics.utilizationRate}%</div>
                </div>
                <div className="analytics-card">
                  <h3>Fuel Efficiency</h3>
                  <div className="big-number">{analytics.fuelEfficiency} km/L</div>
                </div>
                <div className="analytics-card">
                  <h3>Total Trips</h3>
                  <div className="big-number">{analytics.totalTrips}</div>
                </div>
                <div className="analytics-card">
                  <h3>Total Distance</h3>
                  <div className="big-number">{analytics.totalDistance} km</div>
                </div>
                <div className="analytics-card">
                  <h3>Cost per KM</h3>
                  <div className="big-number">${analytics.costPerKm?.toFixed(2)}</div>
                </div>
                <div className="analytics-card">
                  <h3>Maintenance Score</h3>
                  <div className="big-number">{analytics.maintenanceScore}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Optimizer Modal */}
      {showRouteOptimizer && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>🗺️ Route Optimizer: {selectedVehicle?.name}</h2>
              <button className="close-btn" onClick={() => setShowRouteOptimizer(false)}>✕</button>
            </div>
            <div className="route-optimizer">
              <h3>Destinations:</h3>
              {routeData.destinations.map((destination, index) => (
                <div key={index} className="destination-input">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => updateDestination(index, e.target.value)}
                    placeholder={`Destination ${index + 1}`}
                  />
                  {routeData.destinations.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeDestination(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addDestination}>
                ➕ Add Destination
              </button>
              <button 
                className="btn-optimize" 
                onClick={() => optimizeRoute(selectedVehicle._id)}
              >
                🚀 Optimize Route
              </button>

              {routeOptimization && (
                <div className="optimization-results">
                  <h4>🎯 Optimization Results:</h4>
                  <div className="results-grid">
                    <div className="result-item">
                      <span>Estimated Distance:</span>
                      <span>{routeOptimization.estimatedDistance} km</span>
                    </div>
                    <div className="result-item">
                      <span>Estimated Time:</span>
                      <span>{routeOptimization.estimatedTime} minutes</span>
                    </div>
                    <div className="result-item">
                      <span>Fuel Cost:</span>
                      <span>${routeOptimization.estimatedFuelCost?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="savings">
                    <h5>💰 Potential Savings:</h5>
                    <p>Distance: {routeOptimization.savings?.distance?.toFixed(1)} km</p>
                    <p>Time: {routeOptimization.savings?.time?.toFixed(0)} minutes</p>
                    <p>Cost: ${routeOptimization.savings?.fuel?.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleManagement;
