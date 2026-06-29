import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeTracking.css';

function EmployeeTracking() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [taskData, setTaskData] = useState({
    taskId: '',
    description: '',
    estimatedDuration: '',
    priority: 'medium',
    location: ''
  });

  const [locationData, setLocationData] = useState({
    coordinates: { lat: '', lng: '' },
    address: '',
    activity: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/employees');
      setEmployees(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch employees');
      setLoading(false);
    }
  };

  const fetchAnalytics = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/employees/${employeeId}/analytics`);
      setAnalytics(response.data);
      setShowAnalytics(true);
    } catch (err) {
      setError('Failed to fetch analytics');
    }
  };

  const fetchRecommendations = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/employees/${employeeId}/recommendations`);
      setRecommendations(response.data);
    } catch (err) {
      setError('Failed to fetch recommendations');
    }
  };

  const handleClockAction = async (employeeId, action) => {
    try {
      await axios.post(`http://localhost:4000/api/employees/${employeeId}/clock`, {
        action,
        location: 'Office'
      });
      fetchEmployees();
    } catch (err) {
      setError('Failed to update clock status');
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:4000/api/employees/${selectedEmployee._id}/assign-task`, taskData);
      setShowTaskModal(false);
      setTaskData({
        taskId: '',
        description: '',
        estimatedDuration: '',
        priority: 'medium',
        location: ''
      });
      fetchEmployees();
    } catch (err) {
      setError('Failed to assign task');
    }
  };

  const handleCompleteTask = async (employeeId) => {
    try {
      await axios.post(`http://localhost:4000/api/employees/${employeeId}/complete-task`, {
        rating: 5,
        feedback: 'Task completed successfully'
      });
      fetchEmployees();
    } catch (err) {
      setError('Failed to complete task');
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:4000/api/employees/${selectedEmployee._id}/location`, locationData);
      setShowLocationModal(false);
      setLocationData({
        coordinates: { lat: '', lng: '' },
        address: '',
        activity: ''
      });
      fetchEmployees();
    } catch (err) {
      setError('Failed to update location');
    }
  };

  const generateAlert = async (employeeId) => {
    try {
      await axios.post(`http://localhost:4000/api/employees/${employeeId}/generate-alert`);
      alert('Employee alert generated successfully!');
    } catch (err) {
      setError('Failed to generate alert');
    }
  };

  const getWorkStatusColor = (status) => {
    switch (status) {
      case 'clocked-in': return '#4CAF50';
      case 'clocked-out': return '#757575';
      case 'on-break': return '#FF9800';
      case 'on-delivery': return '#2196F3';
      case 'at-event': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getEfficiencyColor = (rating) => {
    if (rating >= 8) return '#4CAF50';
    if (rating >= 6) return '#FF9800';
    if (rating >= 4) return '#F44336';
    return '#757575';
  };

  const getBurnoutRiskColor = (risk) => {
    if (risk >= 0.7) return '#F44336';
    if (risk >= 0.4) return '#FF9800';
    return '#4CAF50';
  };

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div className="employee-tracking">
      <div className="employee-header">
        <h1>👥 Employee Tracking & Analytics</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchEmployees}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="employee-grid">
        {employees.map((emp) => (
          <div key={emp._id} className="employee-card">
            <div className="employee-header-card">
              <div className="employee-info">
                <h3>{emp.name}</h3>
                <p className="employee-role">{emp.role}</p>
                <p className="employee-contact">{emp.contact}</p>
              </div>
              <div className="status-indicators">
                <span
                  className="work-status-badge"
                  style={{ backgroundColor: getWorkStatusColor(emp.tracking?.workStatus) }}
                >
                  {emp.tracking?.workStatus || 'clocked-out'}
                </span>
                {emp.tracking?.currentLocation && (
                  <div className="location-info">
                    📍 {emp.tracking.currentLocation.address || 'Unknown location'}
                  </div>
                )}
              </div>
            </div>

            {emp.tracking && (
              <>
                <div className="ai-insights">
                  <h4>🤖 AI Performance Insights</h4>

                  <div className="efficiency-bar">
                    <span>Efficiency Rating: {emp.tracking.performanceMetrics?.efficiencyRating?.toFixed(1) || 0}/10</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(emp.tracking.performanceMetrics?.efficiencyRating || 0) * 10}%`,
                          backgroundColor: getEfficiencyColor(emp.tracking.performanceMetrics?.efficiencyRating || 0)
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="burnout-risk">
                    <span>Burnout Risk: {((emp.tracking.aiInsights?.burnoutRisk || 0) * 100).toFixed(0)}%</span>
                    <div className="risk-indicator"
                         style={{ backgroundColor: getBurnoutRiskColor(emp.tracking.aiInsights?.burnoutRisk || 0) }}>
                      {(emp.tracking.aiInsights?.burnoutRisk || 0) >= 0.7 ? '🔴 High Risk' :
                       (emp.tracking.aiInsights?.burnoutRisk || 0) >= 0.4 ? '🟡 Medium Risk' : '🟢 Low Risk'}
                    </div>
                  </div>

                  <div className="performance-metrics">
                    <div className="metric">
                      <span>Tasks Completed:</span>
                      <span>{emp.tracking.performanceMetrics?.tasksCompleted || 0}</span>
                    </div>
                    <div className="metric">
                      <span>Avg Task Time:</span>
                      <span>{emp.tracking.performanceMetrics?.averageTaskTime?.toFixed(0) || 0} min</span>
                    </div>
                    <div className="metric">
                      <span>Punctuality:</span>
                      <span>{emp.tracking.performanceMetrics?.punctualityScore || 100}%</span>
                    </div>
                  </div>
                </div>

                {emp.tracking.currentTask && (
                  <div className="current-task">
                    <h5>🎯 Current Task:</h5>
                    <p><strong>{emp.tracking.currentTask.description}</strong></p>
                    <p>Priority: {emp.tracking.currentTask.priority}</p>
                    <p>Started: {new Date(emp.tracking.currentTask.startTime).toLocaleTimeString()}</p>
                    <button
                      className="btn-complete-task"
                      onClick={() => handleCompleteTask(emp.tracking._id)}
                    >
                      ✅ Complete Task
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="employee-actions">
              <div className="clock-actions">
                <button
                  className="btn-clock-in"
                  onClick={() => handleClockAction(emp.tracking?._id, 'in')}
                  disabled={emp.tracking?.workStatus === 'clocked-in'}
                >
                  🕐 Clock In
                </button>
                <button
                  className="btn-clock-out"
                  onClick={() => handleClockAction(emp.tracking?._id, 'out')}
                  disabled={emp.tracking?.workStatus === 'clocked-out'}
                >
                  🕐 Clock Out
                </button>
              </div>

              <div className="management-actions">
                <button
                  className="btn-assign-task"
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setShowTaskModal(true);
                  }}
                >
                  📋 Assign Task
                </button>
                <button
                  className="btn-update-location"
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setShowLocationModal(true);
                  }}
                >
                  📍 Update Location
                </button>
                <button
                  className="btn-analytics"
                  onClick={() => fetchAnalytics(emp._id)}
                >
                  📊 Analytics
                </button>
                <button
                  className="btn-recommendations"
                  onClick={() => fetchRecommendations(emp._id)}
                >
                  💡 AI Recommendations
                </button>
                <button
                  className="btn-alert"
                  onClick={() => generateAlert(emp.tracking?._id)}
                >
                  🚨 Generate Alert
                </button>
              </div>
            </div>

            {emp.tracking?.performanceMetrics?.customerRatings && emp.tracking.performanceMetrics.customerRatings.length > 0 && (
              <div className="recent-ratings">
                <h5>⭐ Recent Ratings:</h5>
                {emp.tracking.performanceMetrics.customerRatings.slice(-2).map((rating, index) => (
                  <div key={index} className="rating-item">
                    <span>⭐ {rating.rating}/5</span>
                    <span>{rating.feedback}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>📋 Assign Task: {selectedEmployee?.name}</h2>
              <button className="close-btn" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAssignTask}>
              <div className="form-group">
                <label>Task ID:</label>
                <input
                  type="text"
                  value={taskData.taskId}
                  onChange={(e) => setTaskData({...taskData, taskId: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                  required
                  rows="3"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Estimated Duration (minutes):</label>
                  <input
                    type="number"
                    value={taskData.estimatedDuration}
                    onChange={(e) => setTaskData({...taskData, estimatedDuration: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority:</label>
                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  value={taskData.location}
                  onChange={(e) => setTaskData({...taskData, location: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Assign Task</button>
                <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Update Modal */}
      {showLocationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>📍 Update Location: {selectedEmployee?.name}</h2>
              <button className="close-btn" onClick={() => setShowLocationModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateLocation}>
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  value={locationData.address}
                  onChange={(e) => setLocationData({...locationData, address: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude:</label>
                  <input
                    type="number"
                    step="any"
                    value={locationData.coordinates.lat}
                    onChange={(e) => setLocationData({
                      ...locationData,
                      coordinates: {...locationData.coordinates, lat: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Longitude:</label>
                  <input
                    type="number"
                    step="any"
                    value={locationData.coordinates.lng}
                    onChange={(e) => setLocationData({
                      ...locationData,
                      coordinates: {...locationData.coordinates, lng: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Activity:</label>
                <select
                  value={locationData.activity}
                  onChange={(e) => setLocationData({...locationData, activity: e.target.value})}
                >
                  <option value="">Select Activity</option>
                  <option value="delivery">Delivery</option>
                  <option value="event">Event</option>
                  <option value="break">Break</option>
                  <option value="meeting">Meeting</option>
                  <option value="travel">Travel</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Update Location</button>
                <button type="button" className="btn-secondary" onClick={() => setShowLocationModal(false)}>
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
              <h2>📊 Employee Analytics</h2>
              <button className="close-btn" onClick={() => setShowAnalytics(false)}>✕</button>
            </div>
            <div className="analytics-content">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Efficiency Rating</h3>
                  <div className="big-number">{analytics.efficiency?.toFixed(1)}/10</div>
                </div>
                <div className="analytics-card">
                  <h3>Tasks Completed</h3>
                  <div className="big-number">{analytics.tasksCompleted}</div>
                </div>
                <div className="analytics-card">
                  <h3>Avg Task Time</h3>
                  <div className="big-number">{analytics.averageTaskTime?.toFixed(0)} min</div>
                </div>
                <div className="analytics-card">
                  <h3>Punctuality Score</h3>
                  <div className="big-number">{analytics.punctualityScore}%</div>
                </div>
                <div className="analytics-card">
                  <h3>Burnout Risk</h3>
                  <div className="big-number">{(analytics.burnoutRisk * 100)?.toFixed(0)}%</div>
                </div>
                <div className="analytics-card">
                  <h3>Avg Rating</h3>
                  <div className="big-number">{analytics.averageRating?.toFixed(1)}/5</div>
                </div>
              </div>

              {analytics.skillAreas && analytics.skillAreas.length > 0 && (
                <div className="skill-areas">
                  <h4>🎯 Skill Areas:</h4>
                  <div className="skills-grid">
                    {analytics.skillAreas.map((skill, index) => (
                      <div key={index} className="skill-item">
                        <span>{skill.skill}</span>
                        <div className="skill-bar">
                          <div
                            className="skill-fill"
                            style={{ width: `${skill.proficiency * 10}%` }}
                          ></div>
                        </div>
                        <span>{skill.proficiency}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {recommendations && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>💡 AI Recommendations</h2>
              <button className="close-btn" onClick={() => setRecommendations(null)}>✕</button>
            </div>
            <div className="recommendations-content">
              {recommendations.schedule && recommendations.schedule.length > 0 && (
                <div className="recommendation-section">
                  <h4>📅 Optimal Schedule:</h4>
                  <div className="schedule-grid">
                    {recommendations.schedule.map((day, index) => (
                      <div key={index} className="schedule-item">
                        <strong>{day.day}</strong>
                        <span>{day.startTime} - {day.endTime}</span>
                        <div className="tasks">
                          {day.tasks?.map((task, i) => (
                            <span key={i} className="task-tag">{task}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recommendations.burnoutPrevention && recommendations.burnoutPrevention.length > 0 && (
                <div className="recommendation-section">
                  <h4>🔥 Burnout Prevention:</h4>
                  <ul>
                    {recommendations.burnoutPrevention.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendations.performanceImprovement && recommendations.performanceImprovement.length > 0 && (
                <div className="recommendation-section">
                  <h4>📈 Performance Improvement:</h4>
                  <ul>
                    {recommendations.performanceImprovement.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeTracking;
