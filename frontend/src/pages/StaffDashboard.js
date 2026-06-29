import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import axios from 'axios';
import './StaffDashboard.css';

function StaffDashboard() {
  // Get real data from context
  const {
    inventory,
    tasks,
    addTask,
    updateTask
  } = useData();

  const [modals, setModals] = useState({
    viewTasks: false,
    updateStatus: false,
    inventory: false,
    schedule: false,
    aiOptimizer: false
  });

  // AI Optimizer state
  const [aiData, setAiData] = useState({
    optimizedTasks: [],
    insights: null,
    recommendations: [],
    loading: false,
    error: null
  });



  const [schedule] = useState([
    { time: '9:00 AM', task: 'Kitchen prep', location: 'Main Kitchen' },
    { time: '12:00 PM', task: 'Lunch service', location: 'ABC Corp Office' },
    { time: '3:00 PM', task: 'Inventory check', location: 'Warehouse' },
    { time: '6:00 PM', task: 'Wedding setup', location: 'Grand Hall' }
  ]);

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
    closeModal('updateStatus');
  };

  const addNewTask = () => {
    const title = prompt('Task title:');
    const priority = prompt('Priority (High/Medium/Low):') || 'Medium';
    const dueTime = prompt('Due time:') || '5:00 PM';

    if (title) {
      addTask({
        title,
        priority,
        dueTime
      });
    }
  };

  // AI Optimizer Functions
  const optimizeTasksWithAI = async () => {
    setAiData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.post('http://localhost:4000/api/ai-tasks/optimize', {
        tasks: tasks
      });

      if (response.data.success) {
        setAiData(prev => ({
          ...prev,
          optimizedTasks: response.data.data.optimizedTasks,
          loading: false
        }));
        openModal('aiOptimizer');
      }
    } catch (error) {
      console.error('Error optimizing tasks:', error);
      setAiData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to optimize tasks. Please try again.'
      }));
    }
  };

  const getAIInsights = async () => {
    setAiData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.post('http://localhost:4000/api/ai-tasks/insights', {
        tasks: tasks,
        completionHistory: [] // Could be fetched from backend
      });

      if (response.data.success) {
        setAiData(prev => ({
          ...prev,
          insights: response.data.data.insights,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error getting AI insights:', error);
      setAiData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to get AI insights. Please try again.'
      }));
    }
  };

  const getAIRecommendations = async () => {
    setAiData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.post('http://localhost:4000/api/ai-tasks/recommendations', {
        tasks: tasks,
        currentContext: {
          currentTime: new Date().toISOString(),
          staffRole: 'Head Chef'
        }
      });

      if (response.data.success) {
        setAiData(prev => ({
          ...prev,
          recommendations: response.data.data.recommendations,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setAiData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to get AI recommendations. Please try again.'
      }));
    }
  };

  // Helper functions for inventory status
  const getInventoryStatus = (item) => {
    if (!item.quantity || item.quantity === 0) return 'out-of-stock';
    if (item.minThreshold && item.quantity <= item.minThreshold) return 'low-stock';
    if (item.maxThreshold && item.quantity >= item.maxThreshold) return 'overstock';
    return 'normal';
  };

  const getInventoryStatusText = (item) => {
    const status = getInventoryStatus(item);
    const statusTexts = {
      'out-of-stock': 'Out of Stock',
      'low-stock': 'Low Stock',
      'overstock': 'Overstock',
      'normal': 'Normal'
    };
    return statusTexts[status] || 'Normal';
  };

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <div className="staff-info">
          <span>Welcome, Priya Sharma (Head Chef)</span>
          <button className="add-task-btn" onClick={addNewTask}>+ Add Task</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{tasks.length}</h3>
            <p>Active Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{tasks.filter(t => t.status === 'Completed').length}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <h3>{tasks.filter(t => t.status === 'In Progress').length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{inventory.filter(i => getInventoryStatus(i) === 'low-stock' || getInventoryStatus(i) === 'out-of-stock').length}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <button className="action-btn" onClick={() => openModal('viewTasks')}>
          <span className="btn-icon">📋</span>
          View All Tasks
        </button>
        <button className="action-btn" onClick={() => openModal('inventory')}>
          <span className="btn-icon">📦</span>
          Check Inventory
        </button>
        <button className="action-btn" onClick={() => openModal('schedule')}>
          <span className="btn-icon">📅</span>
          Today's Schedule
        </button>
        <button className="action-btn" onClick={() => openModal('updateStatus')}>
          <span className="btn-icon">🔄</span>
          Update Status
        </button>
        <button className="action-btn ai-btn" onClick={optimizeTasksWithAI} disabled={aiData.loading}>
          <span className="btn-icon">🤖</span>
          {aiData.loading ? 'Optimizing...' : 'AI Task Optimizer'}
        </button>
      </div>

      {/* Today's Tasks */}
      <div className="tasks-section">
        <h3>Today's Tasks</h3>
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-info">
                <h4>{task.title}</h4>
                <p>Due: {task.dueTime}</p>
                <span className={`priority ${task.priority ? task.priority.toLowerCase() : 'medium'}`}>
                  {task.priority || 'Medium'}
                </span>
              </div>
              <div className={`task-status ${task.status ? task.status.toLowerCase().replace(' ', '-') : 'pending'}`}>
                {task.status || 'Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Tasks Modal */}
      {modals.viewTasks && (
        <div className="modal-overlay" onClick={() => closeModal('viewTasks')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Tasks</h3>
              <button className="close-btn" onClick={() => closeModal('viewTasks')}>×</button>
            </div>
            <div className="modal-body">
              {tasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-details">
                    <h4>{task.title}</h4>
                    <p>Due: {task.dueTime} | Priority: {task.priority}</p>
                  </div>
                  <select 
                    value={task.status} 
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {modals.inventory && (
        <div className="modal-overlay" onClick={() => closeModal('inventory')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Current Inventory</h3>
              <button className="close-btn" onClick={() => closeModal('inventory')}>×</button>
            </div>
            <div className="modal-body">
              <div className="inventory-list">
                {inventory.map((item, index) => (
                  <div key={item._id || index} className="inventory-item">
                    <div className="item-info">
                      <h4>{item.name || item.item || 'Unknown Item'}</h4>
                      <p>{item.quantity || 0} {item.unit || 'units'}</p>
                    </div>
                    <span className={`item-status ${getInventoryStatus(item)}`}>
                      {getInventoryStatusText(item)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {modals.schedule && (
        <div className="modal-overlay" onClick={() => closeModal('schedule')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Today's Schedule</h3>
              <button className="close-btn" onClick={() => closeModal('schedule')}>×</button>
            </div>
            <div className="modal-body">
              <div className="schedule-list">
                {schedule.map((item, index) => (
                  <div key={index} className="schedule-item">
                    <div className="schedule-time">{item.time}</div>
                    <div className="schedule-details">
                      <h4>{item.task}</h4>
                      <p>{item.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {modals.updateStatus && (
        <div className="modal-overlay" onClick={() => closeModal('updateStatus')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Task Status</h3>
              <button className="close-btn" onClick={() => closeModal('updateStatus')}>×</button>
            </div>
            <div className="modal-body">
              <p>Select a task to update its status:</p>
              {tasks.map(task => (
                <div key={task.id} className="status-update-item">
                  <span>{task.title}</span>
                  <select 
                    value={task.status} 
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Task Optimizer Modal */}
      {modals.aiOptimizer && (
        <div className="modal-overlay" onClick={() => closeModal('aiOptimizer')}>
          <div className="modal-content ai-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤖 AI Task Optimizer</h3>
              <button className="close-btn" onClick={() => closeModal('aiOptimizer')}>×</button>
            </div>
            <div className="modal-body">
              {aiData.error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {aiData.error}
                </div>
              )}

              {aiData.loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>AI is analyzing your tasks...</p>
                </div>
              ) : (
                <div className="ai-content">
                  <div className="ai-actions">
                    <button className="ai-action-btn" onClick={getAIInsights}>
                      📊 Get Insights
                    </button>
                    <button className="ai-action-btn" onClick={getAIRecommendations}>
                      💡 Get Recommendations
                    </button>
                    <button className="ai-action-btn" onClick={optimizeTasksWithAI}>
                      ⚡ Re-optimize Tasks
                    </button>
                  </div>

                  {aiData.optimizedTasks.length > 0 && (
                    <div className="optimized-tasks-section">
                      <h4>🎯 Optimized Task Schedule</h4>
                      <div className="optimized-tasks-list">
                        {aiData.optimizedTasks.map((task, index) => (
                          <div key={task.id} className="optimized-task-card">
                            <div className="task-rank">#{index + 1}</div>
                            <div className="task-details">
                              <h5>{task.title}</h5>
                              <div className="task-meta">
                                <span className={`priority ${task.priority ? task.priority.toLowerCase() : 'medium'}`}>
                                  {task.priority || 'Medium'}
                                </span>
                                <span className="due-time">Due: {task.dueTime}</span>
                              </div>
                              {task.aiSuggestions && (
                                <div className="ai-suggestions">
                                  <div className="suggestion-item">
                                    <strong>Optimal Time:</strong> {task.aiSuggestions.optimalStartTime}
                                  </div>
                                  <div className="suggestion-item">
                                    <strong>Est. Duration:</strong> {task.aiSuggestions.estimatedDuration} min
                                  </div>
                                  <div className="suggestion-item">
                                    <strong>Priority Score:</strong> {task.aiSuggestions.priorityScore}/100
                                  </div>
                                  <div className="reasoning">
                                    <strong>AI Reasoning:</strong> {task.aiSuggestions.reasoning}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiData.insights && (
                    <div className="insights-section">
                      <h4>📈 Workload Analysis</h4>
                      <div className="insights-grid">
                        <div className="insight-card">
                          <h5>Current Workload</h5>
                          <p className="workload-level">{aiData.insights.workloadAnalysis.workloadLevel}</p>
                          <p>Efficiency: {aiData.insights.workloadAnalysis.efficiency}%</p>
                        </div>
                        <div className="insight-card">
                          <h5>Task Distribution</h5>
                          <p>Completed: {aiData.insights.workloadAnalysis.completedTasks}</p>
                          <p>In Progress: {aiData.insights.workloadAnalysis.inProgressTasks}</p>
                          <p>Pending: {aiData.insights.workloadAnalysis.pendingTasks}</p>
                        </div>
                        <div className="insight-card">
                          <h5>Completion Rate</h5>
                          <p className="completion-rate">{aiData.insights.workloadAnalysis.completionRate}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aiData.recommendations.length > 0 && (
                    <div className="recommendations-section">
                      <h4>💡 AI Recommendations</h4>
                      <div className="recommendations-list">
                        {aiData.recommendations.map((rec, index) => (
                          <div key={index} className={`recommendation-card ${rec.priority}`}>
                            <div className="rec-header">
                              <span className="rec-type">{rec.type.toUpperCase()}</span>
                              <span className={`rec-priority ${rec.priority}`}>{rec.priority}</span>
                            </div>
                            <p className="rec-message">{rec.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;
