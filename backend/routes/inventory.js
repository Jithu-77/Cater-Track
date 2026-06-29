const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const aiInventoryMonitor = require('../services/aiInventoryMonitor');

// GET: Get all inventory items
router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET: Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST: Add new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, quantity, unit, category, supplier, cost } = req.body;
    
    if (!name || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Name, quantity, and unit are required'
      });
    }
    
    const newItem = new Inventory({
      name,
      quantity: parseInt(quantity),
      unit,
      category: category || 'General',
      supplier: supplier || 'Unknown',
      cost: cost ? parseFloat(cost) : 0
    });
    
    const savedItem = await newItem.save();
    
    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: savedItem
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT: Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { name, quantity, unit, category, supplier, cost } = req.body;
    
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(unit && { unit }),
        ...(category && { category }),
        ...(supplier && { supplier }),
        ...(cost !== undefined && { cost: parseFloat(cost) })
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE: Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: deletedItem
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// AI Inventory Monitoring Routes

// POST: Trigger immediate AI inventory check
router.post('/ai-check', async (req, res) => {
  try {
    await aiInventoryMonitor.triggerImmediateCheck();
    res.json({
      success: true,
      message: 'AI inventory check completed successfully'
    });
  } catch (error) {
    console.error('Error triggering AI inventory check:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform AI inventory check',
      error: error.message
    });
  }
});

// GET: Get AI monitoring status
router.get('/ai-status', (req, res) => {
  try {
    const status = aiInventoryMonitor.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting AI monitoring status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI monitoring status',
      error: error.message
    });
  }
});

// POST: Start AI monitoring
router.post('/ai-start', (req, res) => {
  try {
    aiInventoryMonitor.startMonitoring();
    res.json({
      success: true,
      message: 'AI inventory monitoring started successfully'
    });
  } catch (error) {
    console.error('Error starting AI monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start AI monitoring',
      error: error.message
    });
  }
});

// POST: Stop AI monitoring
router.post('/ai-stop', (req, res) => {
  try {
    aiInventoryMonitor.stopMonitoring();
    res.json({
      success: true,
      message: 'AI inventory monitoring stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping AI monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop AI monitoring',
      error: error.message
    });
  }
});

// GET: Get AI predictions for specific item
router.get('/:id/ai-predictions', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Update AI insights
    item.calculateDemandPattern();
    item.predictFutureDemand();
    item.optimizeStockLevels();
    await item.save();

    res.json({
      success: true,
      data: {
        demandPattern: item.demandPattern,
        predictedDemand: item.predictedDemand,
        aiInsights: item.aiInsights,
        alerts: item.alerts
      }
    });
  } catch (error) {
    console.error('Error getting AI predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI predictions',
      error: error.message
    });
  }
});

// POST: Generate AI alert for specific item
router.post('/:id/generate-alert', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Force generate alert for this item
    const alerts = await aiInventoryMonitor.checkItemAlerts(item);

    if (alerts.length > 0) {
      await aiInventoryMonitor.processAlerts(alerts);
      res.json({
        success: true,
        message: `Generated ${alerts.length} alert(s) for ${item.name}`,
        data: { alertCount: alerts.length }
      });
    } else {
      res.json({
        success: true,
        message: `No alerts needed for ${item.name}`,
        data: { alertCount: 0 }
      });
    }
  } catch (error) {
    console.error('Error generating AI alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI alert',
      error: error.message
    });
  }
});

module.exports = router;
