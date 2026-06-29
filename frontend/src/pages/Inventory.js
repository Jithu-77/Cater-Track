// src/pages/Inventory.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Inventory.css';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    minThreshold: '',
    maxThreshold: '',
  });
  const [showPredictionsModal, setShowPredictionsModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [usageData, setUsageData] = useState({
    quantityUsed: '',
    purpose: '',
    event: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchTerm, selectedCategory]);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:4000/api/inventory');
      setInventory(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch inventory items');
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInventory = () => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredInventory(filtered);
  };

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:4000/api/inventory', newItem);
      await fetchInventory(); // Refresh
      setNewItem({ name: '', category: '', quantity: '', unit: '' });
      setSuccess('Item added successfully!');
      setShowForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add item. Please try again.');
      console.error('Error adding item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 5) return 'low-stock';
    if (quantity <= 20) return 'medium-stock';
    return 'high-stock';
  };

  const getStockStatusText = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 5) return 'Low Stock';
    if (quantity <= 20) return 'Medium Stock';
    return 'In Stock';
  };

  const getUniqueCategories = () => {
    return [...new Set(inventory.map(item => item.category))].filter(Boolean);
  };

  const handleDelete = async (itemId, itemName) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${itemName}"?\n\nThis action cannot be undone.`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setError('');
      await axios.delete(`http://localhost:4000/api/inventory/${itemId}`);

      // Refresh inventory list
      await fetchInventory();
      setSuccess(`"${itemName}" has been deleted successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete item. Please try again.');
      console.error('Error deleting item:', err);
    }
  };

  // AI Functions
  const fetchPredictions = async (itemId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/inventory/${itemId}/predictions`);
      setPredictions(response.data);
      setShowPredictionsModal(true);
    } catch (err) {
      setError('Failed to fetch AI predictions');
      console.error('Error fetching predictions:', err);
    }
  };

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:4000/api/inventory/${selectedItem._id}/usage`, usageData);
      setShowUsageModal(false);
      setUsageData({ quantityUsed: '', purpose: '', event: '' });
      await fetchInventory();
      setSuccess('Usage recorded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to record usage');
      console.error('Error recording usage:', err);
    }
  };

  const generateAlert = async (itemId) => {
    try {
      await axios.post(`http://localhost:4000/api/inventory/${itemId}/generate-alert`);
      setSuccess('AI alert generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to generate alert');
      console.error('Error generating alert:', err);
    }
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">📦</span>
            Inventory Management
          </h1>
          <button
            className="add-item-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <span className="btn-icon">➕</span>
            Add New Item
          </button>
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
      </div>

      {/* Add Item Form */}
      {showForm && (
        <div className="form-container">
          <div className="form-card">
            <div className="form-header">
              <h3>Add New Inventory Item</h3>
              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="inventory-form">
              <div className="form-row">
                <div className="form-group">
                  <div className="input-container">
                    <input
                      type="text"
                      name="name"
                      value={newItem.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder=" "
                    />
                    <label className="form-label">Item Name</label>
                    <div className="input-icon">🏷️</div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-container">
                    <input
                      type="text"
                      name="category"
                      value={newItem.category}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder=" "
                    />
                    <label className="form-label">Category</label>
                    <div className="input-icon">📂</div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="input-container">
                    <input
                      type="number"
                      name="quantity"
                      value={newItem.quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      className="form-input"
                      placeholder=" "
                    />
                    <label className="form-label">Quantity</label>
                    <div className="input-icon">🔢</div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-container">
                    <input
                      type="text"
                      name="unit"
                      value={newItem.unit}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder=" "
                    />
                    <label className="form-label">Unit (e.g., kg, pcs, liters)</label>
                    <div className="input-icon">📏</div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">💾</span>
                      Add Item
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="controls-section">
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>

        <div className="filter-container">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="inventory-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No items found</h3>
            <p>
              {inventory.length === 0
                ? "Start by adding your first inventory item!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="inventory-grid">
            {filteredInventory.map((item) => (
              <div key={item._id} className="inventory-card">
                <div className="card-header">
                  <h3 className="item-name">{item.name}</h3>
                  <span className={`stock-badge ${getStockStatus(item.quantity)}`}>
                    {getStockStatusText(item.quantity)}
                  </span>
                </div>

                <div className="card-body">
                  <div className="item-detail">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{item.category}</span>
                  </div>

                  <div className="item-detail">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value quantity-value">
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  {item.createdAt && (
                    <div className="item-detail">
                      <span className="detail-label">Added:</span>
                      <span className="detail-value">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Insights Section */}
                {item.aiInsights && (
                  <div className="ai-insights">
                    <h5>🤖 AI Insights</h5>
                    {item.aiInsights.optimalStockLevel && (
                      <div className="insight-item">
                        <span>Optimal Stock: {item.aiInsights.optimalStockLevel} {item.unit}</span>
                      </div>
                    )}
                    {item.predictedDemand && (
                      <div className="insight-item">
                        <span>Next Week Demand: {item.predictedDemand.nextWeek} {item.unit}</span>
                        <span className="confidence">({(item.predictedDemand.confidence * 100).toFixed(0)}% confidence)</span>
                      </div>
                    )}
                    {item.alerts && item.alerts.length > 0 && (
                      <div className="alerts">
                        {item.alerts.slice(0, 2).map((alert, index) => (
                          <div key={index} className={`alert ${alert.severity}`}>
                            {alert.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="card-actions">
                  <button className="action-btn edit-btn">
                    <span className="btn-icon">✏️</span>
                    Edit
                  </button>
                  <button
                    className="action-btn ai-btn"
                    onClick={() => fetchPredictions(item._id)}
                  >
                    <span className="btn-icon">🤖</span>
                    AI Predictions
                  </button>
                  <button
                    className="action-btn usage-btn"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowUsageModal(true);
                    }}
                  >
                    <span className="btn-icon">📊</span>
                    Record Usage
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(item._id, item.name)}
                    title={`Delete ${item.name}`}
                  >
                    <span className="btn-icon">🗑️</span>
                    Delete
                  </button>
                  <button
                    className="action-btn alert-btn"
                    onClick={() => generateAlert(item._id)}
                  >
                    <span className="btn-icon">🚨</span>
                    Generate Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Predictions Modal */}
      {showPredictionsModal && predictions && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>🤖 AI Predictions</h2>
              <button className="close-btn" onClick={() => setShowPredictionsModal(false)}>✕</button>
            </div>
            <div className="predictions-content">
              <div className="prediction-section">
                <h4>📊 Demand Pattern</h4>
                {predictions.demandPattern && (
                  <div className="demand-info">
                    <p><strong>Daily Pattern:</strong> {predictions.demandPattern.daily?.join(', ') || 'No data'}</p>
                    <p><strong>Seasonal Trend:</strong> {predictions.demandPattern.seasonal || 'Unknown'}</p>
                  </div>
                )}
              </div>

              <div className="prediction-section">
                <h4>🔮 Future Demand</h4>
                {predictions.predictedDemand && (
                  <div className="demand-predictions">
                    <div className="prediction-item">
                      <span>Next Week:</span>
                      <span>{predictions.predictedDemand.nextWeek} units</span>
                    </div>
                    <div className="prediction-item">
                      <span>Next Month:</span>
                      <span>{predictions.predictedDemand.nextMonth} units</span>
                    </div>
                    <div className="prediction-item">
                      <span>Confidence:</span>
                      <span>{(predictions.predictedDemand.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="prediction-section">
                <h4>💡 AI Recommendations</h4>
                {predictions.recommendations && (
                  <ul className="recommendations-list">
                    {predictions.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Recording Modal */}
      {showUsageModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>📊 Record Usage: {selectedItem.name}</h2>
              <button className="close-btn" onClick={() => setShowUsageModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRecordUsage}>
              <div className="form-group">
                <label>Quantity Used:</label>
                <input
                  type="number"
                  value={usageData.quantityUsed}
                  onChange={(e) => setUsageData({...usageData, quantityUsed: e.target.value})}
                  required
                  min="0"
                  max={selectedItem.quantity}
                />
                <span className="unit-label">{selectedItem.unit}</span>
              </div>
              <div className="form-group">
                <label>Purpose:</label>
                <input
                  type="text"
                  value={usageData.purpose}
                  onChange={(e) => setUsageData({...usageData, purpose: e.target.value})}
                  required
                  placeholder="e.g., Wedding catering, Corporate lunch"
                />
              </div>
              <div className="form-group">
                <label>Event ID (optional):</label>
                <input
                  type="text"
                  value={usageData.event}
                  onChange={(e) => setUsageData({...usageData, event: e.target.value})}
                  placeholder="Event or booking ID"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Record Usage</button>
                <button type="button" className="btn-secondary" onClick={() => setShowUsageModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
