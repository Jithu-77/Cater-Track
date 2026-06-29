import { useState } from 'react';
import { useData } from '../context/DataContext';
import axios from 'axios';
import './CustomerDashboard.css';

function CustomerDashboard() {
  // Get real data from context
  const {
    orders,
    addOrder,
    removeOrder,
    processPayment
  } = useData();

  const [modals, setModals] = useState({
    newOrder: false,
    orderHistory: false,
    profile: false,
    support: false,
    aiAssistant: false,
    editProfile: false
  });

  // AI Assistant state
  const [aiData, setAiData] = useState({
    menuRecommendations: null,
    eventInsights: null,
    smartSuggestions: [],
    budgetOptimization: null,
    loading: false,
    error: null
  });

  // Loading states
  const [cancellingOrder, setCancellingOrder] = useState(null);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 9876543210',
    address: '123 Main Street, New Delhi, India',
    memberSince: 'January 2024'
  });

  const [newOrderData, setNewOrderData] = useState({
    event: '',
    date: '',
    guests: '',
    menu: '',
    budget: ''
  });

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleNewOrder = async (e) => {
    e.preventDefault();
    const orderData = {
      client: 'Rajesh Kumar', // In real app, this would come from user context
      event: newOrderData.event,
      date: newOrderData.date,
      amount: parseInt(newOrderData.budget),
      guests: parseInt(newOrderData.guests),
      menu: newOrderData.menu,
      location: 'New Delhi' // In real app, this would be user input
    };

    await addOrder(orderData);
    setNewOrderData({ event: '', date: '', guests: '', menu: '', budget: '' });
    closeModal('newOrder');
  };

  const handleInputChange = (field, value) => {
    setNewOrderData(prev => ({ ...prev, [field]: value }));
  };

  const cancelOrder = async (orderId) => {
    // Show confirmation dialog
    const confirmCancel = window.confirm(
      '🗑️ Cancel Order\n\nAre you sure you want to cancel this order?\n\n⚠️ This will permanently remove the order from your recent orders list.\n\nThis action cannot be undone.'
    );

    if (!confirmCancel) {
      return;
    }

    // Set loading state
    setCancellingOrder(orderId);

    try {
      console.log('=== CANCEL ORDER DEBUG ===');
      console.log('Cancelling and removing order ID:', orderId);
      console.log('Current orders list:', orders);

      // Find the order to get more details
      const orderToCancel = orders.find(order => order.id === orderId);
      console.log('Order to cancel:', orderToCancel);

      if (!orderToCancel) {
        console.error('Order not found in current orders list!');
        alert('❌ Order not found. Please refresh the page and try again.');
        return;
      }

      // Remove the order directly (no need to update status first)
      console.log('Calling removeOrder function...');
      const success = await removeOrder(orderId);
      console.log('removeOrder returned:', success);

      if (success) {
        console.log('Order removal successful');
        alert('✅ Order Cancelled Successfully!\n\nThe order has been cancelled and removed from your recent orders.');
      } else {
        console.log('Order removal failed');
        alert('❌ Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('❌ Error cancelling order. Please try again.');
    } finally {
      // Clear loading state
      setCancellingOrder(null);
      console.log('=== CANCEL ORDER DEBUG END ===');
    }
  };

  // Profile editing functions
  const handleProfileEdit = () => {
    openModal('editProfile');
  };

  const handleProfileSave = async () => {
    try {
      // In a real app, this would save to backend
      console.log('Saving profile:', profileData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      alert('Profile updated successfully! ✅');
      closeModal('editProfile');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleProcessPayment = async (orderId, amount) => {
    const result = await processPayment({
      amount,
      orderId: `ORD${orderId}`,
      customerInfo: { name: 'Rajesh Kumar', email: 'rajesh@example.com' },
      paymentMethod: 'card'
    });

    if (result && result.success) {
      alert(`Payment of ₹${amount.toLocaleString('en-IN')} processed successfully!`);
    } else {
      alert('Payment processing failed!');
    }
  };

  // AI Assistant Functions
  const getAIMenuRecommendations = async () => {
    setAiData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const eventDetails = {
        eventType: newOrderData.event || 'birthday',
        guests: parseInt(newOrderData.guests) || 50,
        budget: parseInt(newOrderData.budget) || 25000,
        date: newOrderData.date || new Date().toISOString(),
        preferences: { vegetarian: false }
      };

      const response = await axios.post('http://localhost:4000/api/ai-customer/menu-recommendations', {
        customerProfile: {
          name: 'Rajesh Kumar',
          preferences: { vegetarian: false },
          orderHistory: orders
        },
        eventDetails
      });

      if (response.data.success) {
        setAiData(prev => ({
          ...prev,
          menuRecommendations: response.data.data,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error getting AI menu recommendations:', error);
      setAiData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to get AI recommendations. Please try again.'
      }));
    }
  };

  const getAIEventInsights = async () => {
    setAiData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const eventDetails = {
        eventType: newOrderData.event || 'birthday',
        guests: parseInt(newOrderData.guests) || 50,
        budget: parseInt(newOrderData.budget) || 25000,
        date: newOrderData.date || new Date().toISOString()
      };

      const response = await axios.post('http://localhost:4000/api/ai-customer/event-planning', {
        eventDetails,
        customerHistory: orders
      });

      if (response.data.success) {
        setAiData(prev => ({
          ...prev,
          eventInsights: response.data.data.insights,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error getting AI event insights:', error);
      setAiData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to get AI insights. Please try again.'
      }));
    }
  };

  const getSmartSuggestions = async () => {
    setAiData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.post('http://localhost:4000/api/ai-customer/smart-suggestions', {
        customerProfile: {
          name: 'Rajesh Kumar',
          orderHistory: orders
        },
        currentOrder: newOrderData
      });

      if (response.data.success) {
        setAiData(prev => ({
          ...prev,
          smartSuggestions: response.data.data.suggestions,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      setAiData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to get smart suggestions. Please try again.'
      }));
    }
  };

  const getBudgetOptimization = async () => {
    setAiData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.post('http://localhost:4000/api/ai-customer/budget-optimization', {
        budget: parseInt(newOrderData.budget) || 25000,
        guests: parseInt(newOrderData.guests) || 50,
        eventType: newOrderData.event || 'birthday'
      });

      if (response.data.success) {
        setAiData(prev => ({
          ...prev,
          budgetOptimization: response.data.data,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error getting budget optimization:', error);
      setAiData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to get budget optimization. Please try again.'
      }));
    }
  };

  const openAIAssistant = async () => {
    openModal('aiAssistant');
    // Load demo data if no order data is available
    if (!newOrderData.event && !newOrderData.guests && !newOrderData.budget) {
      try {
        const response = await axios.get('http://localhost:4000/api/ai-customer/demo-recommendations');
        if (response.data.success) {
          setAiData(prev => ({
            ...prev,
            menuRecommendations: response.data.data.menuRecommendations,
            eventInsights: response.data.data.eventInsights,
            smartSuggestions: response.data.data.smartSuggestions,
            budgetOptimization: response.data.data.budgetOptimizations
          }));
        }
      } catch (error) {
        console.error('Error loading demo data:', error);
      }
    }
  };

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <h1>Customer Dashboard</h1>
        <div className="customer-info">
          <span>Welcome back, Rajesh Kumar!</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">🎉</div>
          <div className="stat-info">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{orders.filter(o => o.status === 'Confirmed').length}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>₹{orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString('en-IN')}</h3>
            <p>Total Spent</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{orders.reduce((sum, o) => sum + o.guests, 0)}</h3>
            <p>Total Guests</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <button className="action-btn primary" onClick={() => openModal('newOrder')}>
          <span className="btn-icon">➕</span>
          Place New Order
        </button>
        <button className="action-btn" onClick={() => openModal('orderHistory')}>
          <span className="btn-icon">📋</span>
          Order History
        </button>
        <button className="action-btn" onClick={() => openModal('profile')}>
          <span className="btn-icon">👤</span>
          My Profile
        </button>
        <button className="action-btn" onClick={() => openModal('support')}>
          <span className="btn-icon">💬</span>
          Support
        </button>
        <button className="action-btn ai-btn" onClick={openAIAssistant}>
          <span className="btn-icon">🤖</span>
          AI Catering Assistant
        </button>
      </div>

      {/* Recent Orders */}
      <div className="orders-section">
        <h3>Recent Orders</h3>
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📋</div>
              <h4>No Recent Orders</h4>
              <p>You haven't placed any orders yet. Click "Place New Order" to get started!</p>
              <button
                className="btn-primary"
                onClick={() => openModal('newOrder')}
              >
                Place Your First Order
              </button>
            </div>
          ) : (
            orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-info">
                <h4>{order.event}</h4>
                <p>Date: {order.date} | Guests: {order.guests}</p>
                <p className="order-amount">₹{order.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="order-actions">
                <div className={`order-status ${order.status.toLowerCase()}`}>
                  {order.status}
                </div>
                {order.status === 'Confirmed' && (
                  <button
                    className="pay-btn"
                    onClick={() => handleProcessPayment(order.id, order.amount)}
                  >
                    Pay Now
                  </button>
                )}
                {order.status === 'Pending' && (
                  <>
                    <button
                      className="pay-btn"
                      onClick={() => handleProcessPayment(order.id, order.amount)}
                    >
                      Pay Now
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => cancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                    >
                      {cancellingOrder === order.id ? '🔄 Cancelling...' : '🗑️ Cancel'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* New Order Modal */}
      {modals.newOrder && (
        <div className="modal-overlay" onClick={() => closeModal('newOrder')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Place New Order</h3>
              <button className="close-btn" onClick={() => closeModal('newOrder')}>×</button>
            </div>
            <form onSubmit={handleNewOrder} className="order-form">
              <div className="form-group">
                <label>Event Type</label>
                <input
                  type="text"
                  value={newOrderData.event}
                  onChange={(e) => handleInputChange('event', e.target.value)}
                  placeholder="Birthday, Wedding, Corporate..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Event Date</label>
                <input
                  type="date"
                  value={newOrderData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Number of Guests</label>
                <input
                  type="number"
                  value={newOrderData.guests}
                  onChange={(e) => handleInputChange('guests', e.target.value)}
                  placeholder="50"
                  required
                />
              </div>
              <div className="form-group">
                <label>Menu Preference</label>
                <select
                  value={newOrderData.menu}
                  onChange={(e) => handleInputChange('menu', e.target.value)}
                  required
                >
                  <option value="">Select Menu</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="mixed">Mixed</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="form-group">
                <label>Budget (₹)</label>
                <input
                  type="number"
                  value={newOrderData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="10000"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => closeModal('newOrder')}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {modals.orderHistory && (
        <div className="modal-overlay" onClick={() => closeModal('orderHistory')}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order History</h3>
              <button className="close-btn" onClick={() => closeModal('orderHistory')}>×</button>
            </div>
            <div className="modal-body">
              <div className="history-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Guests</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.event}</td>
                        <td>{order.date}</td>
                        <td>{order.guests}</td>
                        <td>₹{order.amount.toLocaleString('en-IN')}</td>
                        <td><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {modals.profile && (
        <div className="modal-overlay" onClick={() => closeModal('profile')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>My Profile</h3>
              <button className="close-btn" onClick={() => closeModal('profile')}>×</button>
            </div>
            <div className="modal-body">
              <div className="profile-info">
                <div className="profile-field">
                  <label>Name:</label>
                  <span>{profileData.name}</span>
                </div>
                <div className="profile-field">
                  <label>Email:</label>
                  <span>{profileData.email}</span>
                </div>
                <div className="profile-field">
                  <label>Phone:</label>
                  <span>{profileData.phone}</span>
                </div>
                <div className="profile-field">
                  <label>Address:</label>
                  <span>{profileData.address}</span>
                </div>
                <div className="profile-field">
                  <label>Member Since:</label>
                  <span>{profileData.memberSince}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="btn-primary" onClick={handleProfileEdit}>Edit Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {modals.editProfile && (
        <div className="modal-overlay" onClick={() => closeModal('editProfile')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="close-btn" onClick={() => closeModal('editProfile')}>×</button>
            </div>
            <div className="modal-body">
              <div className="edit-profile-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileInputChange('name', e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <textarea
                    value={profileData.address}
                    onChange={(e) => handleProfileInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                    rows="3"
                  />
                </div>
              </div>
              <div className="profile-actions">
                <button className="btn-primary" onClick={handleProfileSave}>Save Changes</button>
                <button className="btn-secondary" onClick={() => closeModal('editProfile')}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {modals.support && (
        <div className="modal-overlay" onClick={() => closeModal('support')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Support</h3>
              <button className="close-btn" onClick={() => closeModal('support')}>×</button>
            </div>
            <div className="modal-body">
              <div className="support-options">
                <div className="support-item">
                  <h4>📞 Call Support</h4>
                  <p>+91 1800-123-4567</p>
                  <p>Available 24/7</p>
                </div>
                <div className="support-item">
                  <h4>📧 Email Support</h4>
                  <p>support@catering.com</p>
                  <p>Response within 2 hours</p>
                </div>
                <div className="support-item">
                  <h4>💬 Live Chat</h4>
                  <p>Chat with our team</p>
                  <button className="btn-primary">Start Chat</button>
                </div>
                <div className="support-item">
                  <h4>❓ FAQ</h4>
                  <p>Find answers to common questions</p>
                  <button className="btn-secondary">View FAQ</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Catering Assistant Modal */}
      {modals.aiAssistant && (
        <div className="modal-overlay" onClick={() => closeModal('aiAssistant')}>
          <div className="modal-content ai-modal large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤖 AI Catering Assistant</h3>
              <button className="close-btn" onClick={() => closeModal('aiAssistant')}>×</button>
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
                  <p>AI is analyzing your preferences...</p>
                </div>
              ) : (
                <div className="ai-content">
                  <div className="ai-actions">
                    <button className="ai-action-btn" onClick={getAIMenuRecommendations}>
                      🍽️ Menu Recommendations
                    </button>
                    <button className="ai-action-btn" onClick={getAIEventInsights}>
                      📊 Event Planning Insights
                    </button>
                    <button className="ai-action-btn" onClick={getSmartSuggestions}>
                      💡 Smart Suggestions
                    </button>
                    <button className="ai-action-btn" onClick={getBudgetOptimization}>
                      💰 Budget Optimization
                    </button>
                  </div>

                  {aiData.menuRecommendations && (
                    <div className="menu-recommendations-section">
                      <h4>🍽️ AI Menu Recommendations</h4>
                      <div className="confidence-score">
                        <span>Confidence Score: {Math.round(aiData.menuRecommendations.confidenceScore * 100)}%</span>
                      </div>

                      <div className="menu-categories">
                        {Object.entries(aiData.menuRecommendations.recommendations).map(([category, items]) => (
                          <div key={category} className="menu-category">
                            <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                            <div className="menu-items">
                              {items.map((item, index) => (
                                <div key={index} className="menu-item-card">
                                  <div className="item-header">
                                    <h6>{item.name}</h6>
                                    <span className="item-price">₹{item.price}</span>
                                  </div>
                                  <div className="item-details">
                                    <div className="popularity-score">
                                      Popularity: {Math.round(item.popularity * 100)}%
                                    </div>
                                    <div className="ai-score">
                                      AI Score: {Math.round(item.aiScore * 100)}/100
                                    </div>
                                    {item.recommended && (
                                      <div className="recommended-badge">✨ Recommended</div>
                                    )}
                                  </div>
                                  {item.reasoning && (
                                    <div className="item-reasoning">
                                      <strong>Why recommended:</strong> {item.reasoning}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="total-cost">
                        <h5>Estimated Total Cost: ₹{aiData.menuRecommendations.totalEstimatedCost?.toLocaleString('en-IN')}</h5>
                      </div>

                      <div className="ai-reasoning">
                        <h5>AI Reasoning:</h5>
                        <ul>
                          {aiData.menuRecommendations.reasoning?.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {aiData.eventInsights && (
                    <div className="event-insights-section">
                      <h4>📊 Event Planning Insights</h4>

                      {aiData.eventInsights.budgetAnalysis && (
                        <div className="budget-analysis">
                          <h5>💰 Budget Analysis</h5>
                          <div className={`budget-status ${aiData.eventInsights.budgetAnalysis.status}`}>
                            <strong>Status:</strong> {aiData.eventInsights.budgetAnalysis.status.toUpperCase()}
                          </div>
                          <p>{aiData.eventInsights.budgetAnalysis.message}</p>
                          <div className="budget-details">
                            <p><strong>Your Budget per Person:</strong> ₹{aiData.eventInsights.budgetAnalysis.budgetPerPerson}</p>
                            <p><strong>Recommended Budget per Person:</strong> ₹{aiData.eventInsights.budgetAnalysis.recommendedBudgetPerPerson}</p>
                          </div>
                          {aiData.eventInsights.budgetAnalysis.recommendations?.length > 0 && (
                            <div className="budget-recommendations">
                              <strong>Recommendations:</strong>
                              <ul>
                                {aiData.eventInsights.budgetAnalysis.recommendations.map((rec, index) => (
                                  <li key={index}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {aiData.eventInsights.timingRecommendations && (
                        <div className="timing-recommendations">
                          <h5>⏰ Timing Recommendations</h5>
                          <div className="optimal-timing">
                            <p><strong>Optimal Timing:</strong> {aiData.eventInsights.timingRecommendations.optimalTiming?.start} - {aiData.eventInsights.timingRecommendations.optimalTiming?.end}</p>
                          </div>
                          <div className="timing-insights">
                            <p><strong>Day Insight:</strong> {aiData.eventInsights.timingRecommendations.dayOfWeekInsights}</p>
                            <p><strong>Seasonal Factor:</strong> {aiData.eventInsights.timingRecommendations.seasonalFactors}</p>
                            <p><strong>Booking Advice:</strong> {aiData.eventInsights.timingRecommendations.bookingAdvice}</p>
                          </div>
                        </div>
                      )}

                      {aiData.eventInsights.costOptimizations?.length > 0 && (
                        <div className="cost-optimizations">
                          <h5>💡 Cost Optimization Tips</h5>
                          <div className="optimization-list">
                            {aiData.eventInsights.costOptimizations.map((opt, index) => (
                              <div key={index} className="optimization-item">
                                <div className="opt-header">
                                  <span className="opt-type">{opt.type.toUpperCase()}</span>
                                  <span className="opt-savings">Save {opt.savings}</span>
                                </div>
                                <p>{opt.suggestion}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {aiData.smartSuggestions?.length > 0 && (
                    <div className="smart-suggestions-section">
                      <h4>💡 Smart Suggestions</h4>
                      <div className="suggestions-list">
                        {aiData.smartSuggestions.map((suggestion, index) => (
                          <div key={index} className="suggestion-card">
                            <div className="suggestion-header">
                              <h5>{suggestion.title}</h5>
                              <div className="confidence-badge">
                                {Math.round(suggestion.confidence * 100)}% confidence
                              </div>
                            </div>
                            <div className="suggestion-items">
                              {suggestion.items?.map((item, itemIndex) => (
                                <div key={itemIndex} className="suggestion-item">
                                  <span className="item-name">{item.name}</span>
                                  {item.frequency && (
                                    <span className="item-frequency">Ordered {item.frequency} times</span>
                                  )}
                                  {item.popularity && (
                                    <span className="item-popularity">{Math.round(item.popularity * 100)}% popular</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiData.budgetOptimization && (
                    <div className="budget-optimization-section">
                      <h4>💰 Budget Optimization</h4>

                      {aiData.budgetOptimization.optimizations?.length > 0 && (
                        <div className="optimization-tips">
                          <h5>Money-Saving Tips</h5>
                          {aiData.budgetOptimization.optimizations.map((opt, index) => (
                            <div key={index} className="optimization-tip">
                              <div className="tip-header">
                                <span className="tip-type">{opt.type.toUpperCase()}</span>
                                <span className="tip-savings">💰 Save {opt.savings}</span>
                              </div>
                              <p>{opt.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Catering Assistant Modal */}
      {modals.aiAssistant && (
        <div className="modal-overlay" onClick={() => closeModal('aiAssistant')}>
          <div className="modal-content ai-modal large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤖 AI Catering Assistant</h3>
              <button className="close-btn" onClick={() => closeModal('aiAssistant')}>×</button>
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
                  <p>AI is analyzing your preferences...</p>
                </div>
              ) : (
                <div className="ai-content">
                  <div className="ai-actions">
                    <button className="ai-action-btn" onClick={getAIMenuRecommendations}>
                      🍽️ Menu Recommendations
                    </button>
                    <button className="ai-action-btn" onClick={getAIEventInsights}>
                      📊 Event Planning Insights
                    </button>
                    <button className="ai-action-btn" onClick={getSmartSuggestions}>
                      💡 Smart Suggestions
                    </button>
                    <button className="ai-action-btn" onClick={getBudgetOptimization}>
                      💰 Budget Optimization
                    </button>
                  </div>

                  {aiData.menuRecommendations && (
                    <div className="menu-recommendations-section">
                      <h4>🍽️ AI Menu Recommendations</h4>
                      <div className="confidence-score">
                        Confidence: {Math.round(aiData.menuRecommendations.confidenceScore * 100)}%
                      </div>

                      <div className="menu-categories">
                        {Object.entries(aiData.menuRecommendations.recommendations).map(([category, items]) => (
                          <div key={category} className="menu-category">
                            <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                            <div className="menu-items">
                              {items.map((item, index) => (
                                <div key={index} className="menu-item-card">
                                  <div className="item-header">
                                    <h6>{item.name}</h6>
                                    <span className="item-price">₹{item.price}</span>
                                  </div>
                                  <div className="item-details">
                                    <div className="popularity-score">
                                      Popularity: {Math.round(item.popularity * 100)}%
                                    </div>
                                    <div className="ai-score">
                                      AI Score: {Math.round(item.aiScore * 100)}/100
                                    </div>
                                    {item.recommended && (
                                      <div className="recommended-badge">✨ Recommended</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="total-cost">
                        <h5>Total: ₹{aiData.menuRecommendations.totalEstimatedCost?.toLocaleString('en-IN')}</h5>
                      </div>
                    </div>
                  )}

                  {aiData.eventInsights && (
                    <div className="event-insights-section">
                      <h4>📊 Event Planning Insights</h4>

                      {aiData.eventInsights.budgetAnalysis && (
                        <div className="budget-analysis">
                          <h5>💰 Budget Analysis</h5>
                          <div className={`budget-status ${aiData.eventInsights.budgetAnalysis.status}`}>
                            Status: {aiData.eventInsights.budgetAnalysis.status.toUpperCase()}
                          </div>
                          <p>{aiData.eventInsights.budgetAnalysis.message}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {aiData.smartSuggestions?.length > 0 && (
                    <div className="smart-suggestions-section">
                      <h4>💡 Smart Suggestions</h4>
                      <div className="suggestions-list">
                        {aiData.smartSuggestions.map((suggestion, index) => (
                          <div key={index} className="suggestion-card">
                            <h5>{suggestion.title}</h5>
                            <div className="confidence-badge">
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiData.budgetOptimization && (
                    <div className="budget-optimization-section">
                      <h4>💰 Budget Optimization</h4>
                      {aiData.budgetOptimization.optimizations?.length > 0 && (
                        <div className="optimization-tips">
                          {aiData.budgetOptimization.optimizations.map((opt, index) => (
                            <div key={index} className="optimization-tip">
                              <span className="tip-type">{opt.type.toUpperCase()}</span>
                              <span className="tip-savings">Save {opt.savings}</span>
                              <p>{opt.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      )}
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

export default CustomerDashboard;