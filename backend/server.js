const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const notificationRoutes = require('./routes/notifications');
const vehicleRoutes = require('./routes/Vehicle');
const aiTaskRoutes = require('./routes/aiTasks');
const aiCustomerRoutes = require('./routes/aiCustomer');
const aiInventoryMonitor = require('./services/aiInventoryMonitor');

// Use routes with prefixes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/ai-tasks', aiTaskRoutes);
app.use('/api/ai-customer', aiCustomerRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Start AI Inventory Monitoring after DB connection
    aiInventoryMonitor.startMonitoring();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Root route
app.get('/', (_, res) => {
  res.send('🎉 Modern Catering Management API is working!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Modern Catering Management Server running on http://localhost:${PORT}`);
});
