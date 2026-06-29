import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import AIInventoryDashboard from '../components/AIInventoryDashboard';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Get real data from context
  const {
    inventory,
    orders,
    payments,
    stats,
    loading,
    addInventoryItem,
    deleteInventoryItem,
    processPayment
  } = useData();

  // Custom handlers for admin dashboard
  const handleAddInventory = async () => {
    const name = prompt('Item name:');
    const quantity = prompt('Quantity:');
    const unit = prompt('Unit (kg, L, pcs):');

    if (name && quantity && unit) {
      await addInventoryItem({
        name,
        quantity: parseInt(quantity),
        unit
      });
    }
  };

  const handleProcessPayment = async (amount) => {
    await processPayment({
      amount,
      orderId: `ORD${Date.now()}`,
      customerInfo: { name: 'Test Customer' },
      paymentMethod: 'card'
    });
  };

  if (loading) {
    return (
      <div className="simple-admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🍽️ Admin Dashboard</h1>
        <p>Catering Management System</p>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={activeSection === 'dashboard' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeSection === 'inventory' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('inventory')}
        >
          Inventory
        </button>
        <button
          className={activeSection === 'orders' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('orders')}
        >
          Orders
        </button>
        <button
          className={activeSection === 'payments' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('payments')}
        >
          Payments
        </button>
        <button
          className={activeSection === 'ai-inventory' ? 'tab active' : 'tab'}
          onClick={() => setActiveSection('ai-inventory')}
        >
          🤖 AI Inventory
        </button>
      </div>

      {/* Dashboard Content */}
      {activeSection === 'dashboard' && (
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{stats.inventoryItems}</h3>
                <p>Inventory Items</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚛</div>
              <div className="stat-info">
                <h3>{stats.activeVehicles}</h3>
                <p>Active Vehicles</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{stats.staffMembers}</h3>
                <p>Staff Members</p>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="quick-info">
            <h3>System Status</h3>
            <div className="status-list">
              <div className="status-item">✅ All systems operational</div>
              <div className="status-item">📦 Inventory levels normal</div>
              <div className="status-item">🚛 All vehicles active</div>
              <div className="status-item">💰 Revenue: ₹{stats.revenue.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Section */}
      {activeSection === 'inventory' && (
        <div className="inventory-content">
          <div className="section-header">
            <h3>Inventory Management</h3>
            <button className="add-btn" onClick={handleAddInventory}>+ Add Item</button>
          </div>

          <div className="inventory-list">
            {inventory.map(item => (
              <div key={item._id || item.id} className="inventory-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>{item.quantity} {item.unit}</p>
                  <span className={`status ${item.status ? item.status.toLowerCase().replace(' ', '-') : 'unknown'}`}>
                    {item.status || 'Unknown'}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteInventoryItem(item._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Section */}
      {activeSection === 'orders' && (
        <div className="orders-content">
          <div className="section-header">
            <h3>Recent Orders</h3>
          </div>

          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.client}</td>
                    <td>{order.event}</td>
                    <td>{order.date}</td>
                    <td>₹{order.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status ${order.status ? order.status.toLowerCase() : 'unknown'}`}>
                        {order.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Section */}
      {activeSection === 'payments' && (
        <div className="payments-content">
          <div className="section-header">
            <h3>Payment Management</h3>
            <div className="payment-actions">
              <button
                className="add-btn"
                onClick={() => handleProcessPayment(25000)}
              >
                Process ₹25,000
              </button>
              <button
                className="add-btn"
                onClick={() => handleProcessPayment(50000)}
              >
                Process ₹50,000
              </button>
            </div>
          </div>

          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.orderId}</td>
                    <td>₹{payment.amount.toLocaleString('en-IN')}</td>
                    <td>{payment.method}</td>
                    <td>{payment.date}</td>
                    <td>
                      <span className={`status ${payment.status ? payment.status.toLowerCase() : 'unknown'}`}>
                        {payment.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Inventory Management */}
      {activeSection === 'ai-inventory' && (
        <div className="ai-inventory-section">
          <AIInventoryDashboard />
        </div>
      )}
    </div>
  );
}
<div className="stats-grid">
  <div className="card revenue">
    <h3>Total Revenue</h3>
    <p>₹1,25,000</p>
  </div>

  <div className="card orders">
    <h3>Total Orders</h3>
    <p>85</p>
  </div>

  <div className="card stock">
    <h3>Low Stock Alerts</h3>
    <p>6 Items</p>
  </div>

  <div className="card staff">
    <h3>Active Staff</h3>
    <p>12 Members</p>
  </div>
</div>

export default AdminDashboard;