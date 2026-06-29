import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Centralized state for all data
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([
    // Sample orders for testing
    {
      id: 1,
      orderId: 'ORD001',
      client: 'Rajesh Kumar',
      event: 'Birthday Party',
      date: '2024-01-15',
      amount: 15000,
      status: 'Pending',
      guests: 50,
      menu: 'Paneer Tikka, Dal Makhani, Gulab Jamun',
      location: 'New Delhi'
    },
    {
      id: 2,
      orderId: 'ORD002',
      client: 'Rajesh Kumar',
      event: 'Anniversary Celebration',
      date: '2024-01-20',
      amount: 25000,
      status: 'Confirmed',
      guests: 30,
      menu: 'Butter Chicken, Biryani, Rasgulla',
      location: 'Gurgaon'
    }
  ]);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inventoryItems: 0,
    activeVehicles: 12,
    staffMembers: 45,
    revenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [ordersModifiedLocally, setOrdersModifiedLocally] = useState(false);

  const API_BASE = 'http://localhost:4000/api';

  // Fetch all data from backend
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch inventory
      const inventoryRes = await fetch(`${API_BASE}/inventory`);
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventory(inventoryData.data || []);
      }

      // Fetch orders (only if we don't have sample orders and haven't modified locally)
      if (orders.length === 0 && !ordersModifiedLocally) {
        const ordersRes = await fetch(`${API_BASE}/orders`);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.data && ordersData.data.length > 0) {
            setOrders(ordersData.data);
          }
        }
      }

      // Fetch order stats
      const statsRes = await fetch(`${API_BASE}/orders/stats/summary`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({
          ...prev,
          totalOrders: statsData.data.totalOrders,
          revenue: statsData.data.totalRevenue,
          inventoryItems: inventory.length
        }));
      }

      // Fetch payments
      const paymentsRes = await fetch(`${API_BASE}/payments/history`);
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.data || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, inventory.length]);

  // Fetch only inventory and stats (not orders) for polling
  const fetchInventoryOnly = useCallback(async () => {
    try {
      // Fetch inventory
      const inventoryRes = await fetch(`${API_BASE}/inventory`);
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventory(inventoryData.data || []);
      }

      // Fetch order stats (but not the orders themselves)
      const statsRes = await fetch(`${API_BASE}/orders/stats/summary`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({
          ...prev,
          totalOrders: statsData.data.totalOrders,
          revenue: statsData.data.totalRevenue,
          inventoryItems: inventory.length
        }));
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  }, [API_BASE, inventory.length]);

  // Initialize tasks for staff dashboard
  const initializeTasks = () => {
    const initialTasks = [
      { id: 1, title: 'Check morning inventory', status: 'Pending', priority: 'High', dueTime: '9:00 AM' },
      { id: 2, title: 'Prepare lunch orders', status: 'In Progress', priority: 'High', dueTime: '11:00 AM' },
      { id: 3, title: 'Update delivery status', status: 'Pending', priority: 'Medium', dueTime: '2:00 PM' }
    ];
    setTasks(initialTasks);
  };

  // Load data on component mount
  useEffect(() => {
    fetchAllData();
    initializeTasks();

    // Set up polling for real-time updates every 30 seconds (but skip orders to avoid overriding local changes)
    const interval = setInterval(() => {
      // Only fetch inventory and other data, not orders
      fetchInventoryOnly();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData, fetchInventoryOnly]);

  // Update stats when data changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      inventoryItems: inventory.length,
      totalOrders: orders.length,
      revenue: orders.reduce((sum, order) => sum + (order.amount || 0), 0)
    }));
  }, [inventory, orders]);

  // Inventory operations
  const addInventoryItem = async (itemData) => {
    try {
      const response = await fetch(`${API_BASE}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setInventory(prev => [...prev, result.data]);
        
        // Add task for staff to check new inventory
        const newTask = {
          id: tasks.length + 1,
          title: `Check new inventory: ${itemData.name}`,
          status: 'Pending',
          priority: 'Medium',
          dueTime: 'ASAP'
        };
        setTasks(prev => [...prev, newTask]);
        
        return result;
      }
    } catch (error) {
      console.error('Error adding inventory:', error);
    }
  };

  const updateInventoryItem = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE}/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const result = await response.json();
        setInventory(prev => prev.map(item => 
          item.id === id ? result.data : item
        ));
        return result;
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/inventory/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setInventory(prev => prev.filter(item => item._id !== id));
      }
    } catch (error) {
      console.error('Error deleting inventory:', error);
    }
  };

  // Order operations
  const addOrder = async (orderData) => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setOrders(prev => [...prev, result.data]);
        setOrdersModifiedLocally(true);

        // Add task for staff to prepare order
        const newTask = {
          id: tasks.length + 1,
          title: `Prepare order: ${orderData.event}`,
          status: 'Pending',
          priority: 'High',
          dueTime: orderData.date
        };
        setTasks(prev => [...prev, newTask]);

        return result;
      }
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const updateOrder = async (id, updates) => {
    try {
      console.log('Updating order:', id, 'with updates:', updates);

      const response = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Update response:', result);

        setOrders(prev => prev.map(order =>
          order.id === id ? { ...order, ...updates } : order
        ));
        return result;
      } else {
        console.error('Update failed with status:', response.status);
        // Fallback: update locally even if backend fails
        setOrders(prev => prev.map(order =>
          order.id === id ? { ...order, ...updates } : order
        ));
        return { success: true, message: 'Updated locally' };
      }
    } catch (error) {
      console.error('Error updating order:', error);
      // Fallback: update locally even if backend fails
      setOrders(prev => prev.map(order =>
        order.id === id ? { ...order, ...updates } : order
      ));
      return { success: true, message: 'Updated locally (offline)' };
    }
  };

  // Remove order function
  const removeOrder = async (id) => {
    try {
      console.log('Removing order with ID:', id);
      console.log('Current orders before removal:', orders);

      // Try to delete from backend first
      const response = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log('Order deleted from backend successfully');
      } else {
        console.log('Backend delete failed, proceeding with local removal');
      }

      // Remove from local state regardless of backend response
      setOrders(prev => {
        const filteredOrders = prev.filter(order => order.id !== id);
        console.log('Orders after filtering:', filteredOrders);
        return filteredOrders;
      });

      // Mark orders as locally modified to prevent backend overrides
      setOrdersModifiedLocally(true);

      console.log('Order removal completed');
      return true;
    } catch (error) {
      console.error('Error removing order:', error);

      // Fallback: remove locally even if backend fails
      setOrders(prev => {
        const filteredOrders = prev.filter(order => order.id !== id);
        console.log('Orders after fallback filtering:', filteredOrders);
        return filteredOrders;
      });

      // Mark orders as locally modified to prevent backend overrides
      setOrdersModifiedLocally(true);

      console.log('Order removed locally (fallback)');
      return true; // Still return true since local removal succeeded
    }
  };

  // Task operations
  const addTask = (taskData) => {
    const newTask = {
      id: tasks.length + 1,
      ...taskData,
      status: 'Pending'
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  // Payment operations
  const processPayment = async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE}/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update order status to paid
        if (paymentData.orderId) {
          const orderToUpdate = orders.find(o => o.orderId === paymentData.orderId);
          if (orderToUpdate) {
            await updateOrder(orderToUpdate.id, { status: 'Paid' });
          }
        }
        
        // Add to payments list
        const newPayment = {
          id: payments.length + 1,
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          status: 'Completed',
          method: paymentData.paymentMethod || 'Card',
          date: new Date().toISOString().split('T')[0]
        };
        setPayments(prev => [...prev, newPayment]);
        
        return result;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const value = {
    // Data
    inventory,
    orders,
    tasks,
    payments,
    stats,
    loading,
    
    // Operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addOrder,
    updateOrder,
    removeOrder,
    addTask,
    updateTask,
    processPayment,
    
    // Utilities
    refreshData: fetchAllData,
    resetOrdersFlag: () => setOrdersModifiedLocally(false)
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
