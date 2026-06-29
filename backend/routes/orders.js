const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET: Get all orders
router.get('/', async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    let query = {};

    // Filter by status if provided
    if (status) {
      query.status = new RegExp(status, 'i');
    }

    // Pagination
    const skip = (page - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET: Get order by ID
router.get('/:id', (req, res) => {
  try {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST: Create new order
router.post('/', async (req, res) => {
  try {
    const { client, event, date, amount, guests, menu, location } = req.body;

    // Validation
    if (!client || !event || !date || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Client, event, date, and amount are required'
      });
    }

    const newOrder = new Order({
      client,
      event,
      date: new Date(date),
      amount: parseInt(amount),
      guests: guests || 0,
      menu: menu || 'Mixed',
      location: location || ''
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT: Update order
router.put('/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const { client, event, date, amount, status, guests, menu, location } = req.body;
    
    // Update order
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...(client && { client }),
      ...(event && { event }),
      ...(date && { date }),
      ...(amount && { amount: parseInt(amount) }),
      ...(status && { status }),
      ...(guests && { guests: parseInt(guests) }),
      ...(menu && { menu }),
      ...(location && { location })
    };
    
    res.json({
      success: true,
      message: 'Order updated successfully',
      data: orders[orderIndex]
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE: Delete order
router.delete('/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const deletedOrder = orders.splice(orderIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Order deleted successfully',
      data: deletedOrder
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET: Get order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Order.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE: Remove order
router.delete('/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Remove the order from the array
    const deletedOrder = orders.splice(orderIndex, 1)[0];

    res.json({
      success: true,
      message: 'Order deleted successfully',
      data: deletedOrder
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
});

module.exports = router;
