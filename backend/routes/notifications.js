const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET: Get all notifications with filtering
router.get('/', async (req, res) => {
  try {
    const { userId, role, type, priority, unreadOnly } = req.query;
    
    let filter = {};
    
    // Filter by recipient
    if (userId) {
      filter['recipients.user'] = userId;
    }
    if (role) {
      filter['recipients.role'] = role;
    }
    
    // Filter by type and priority
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    
    // Filter unread only
    if (unreadOnly === 'true') {
      filter['recipients.read'] = false;
    }
    
    const notifications = await Notification.find(filter)
      .populate('recipients.userId', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
});

// GET: Get notification by ID
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('recipients.userId', 'name email role')
      .populate('resolvedBy', 'name email');
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Increment view count
    notification.analytics.views += 1;
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notification', error: err.message });
  }
});

// POST: Create new notification
router.post('/', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    
    // Auto-calculate priority if AI insights are provided
    if (notification.aiInsights && notification.aiInsights.urgency && notification.aiInsights.impact) {
      notification.calculatePriority();
    }
    
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ message: 'Error creating notification', error: err.message });
  }
});

// PUT: Update notification
router.put('/:id', async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    
    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(updatedNotification);
  } catch (err) {
    res.status(400).json({ message: 'Error updating notification', error: err.message });
  }
});

// DELETE: Remove notification
router.delete('/:id', async (req, res) => {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting notification', error: err.message });
  }
});

// POST: Mark notification as read
router.post('/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Find recipient and mark as read
    const recipient = userId
      ? notification.recipients.find(r => r.userId && r.userId.toString() === userId)
      : null;

    if (recipient) {
      recipient.read = true;
      recipient.readAt = new Date();
    } else if (!userId && notification.recipients.length === 0) {
      notification.analytics.views += 1;
    }

    await notification.save();
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(400).json({ message: 'Error marking notification as read', error: err.message });
  }
});

// POST: Mark notification as resolved
router.post('/:id/resolve', async (req, res) => {
  try {
    const { resolvedBy } = req.body;
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.resolved = true;
    notification.resolvedAt = new Date();
    if (resolvedBy && mongoose.Types.ObjectId.isValid(resolvedBy)) {
      notification.resolvedBy = resolvedBy;
    }
    
    await notification.save();
    
    res.json({ message: 'Notification resolved successfully', notification });
  } catch (err) {
    res.status(400).json({ message: 'Error resolving notification', error: err.message });
  }
});

// POST: Track notification action (click, etc.)
router.post('/:id/track', async (req, res) => {
  try {
    const { action } = req.body; // 'click' or 'action'
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (action === 'click') {
      notification.analytics.clicks += 1;
    } else if (action === 'action') {
      notification.analytics.actions += 1;
    }
    
    // Recalculate effectiveness
    notification.trackEffectiveness();
    await notification.save();
    
    res.json({ message: 'Action tracked successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error tracking action', error: err.message });
  }
});

// GET: Get notification analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    const analytics = {
      views: notification.analytics.views,
      clicks: notification.analytics.clicks,
      actions: notification.analytics.actions,
      effectiveness: notification.analytics.effectiveness,
      readRate: notification.recipients.length > 0 ? 
        notification.recipients.filter(r => r.read).length / notification.recipients.length : 0,
      clickRate: notification.analytics.views > 0 ? 
        notification.analytics.clicks / notification.analytics.views : 0,
      actionRate: notification.analytics.clicks > 0 ? 
        notification.analytics.actions / notification.analytics.clicks : 0,
      totalRecipients: notification.recipients.length,
      readCount: notification.recipients.filter(r => r.read).length
    };
    
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
});

// POST: Generate AI-powered notification
router.post('/generate-ai', async (req, res) => {
  try {
    const { type, context, recipients } = req.body;
    
    let notification;
    
    switch (type) {
      case 'inventory_alert':
        notification = new Notification({
          title: `Low Stock Alert: ${context.name}`,
          message: `${context.name} is running low with only ${context.quantity} ${context.unit} remaining.`,
          type: 'inventory_alert',
          priority: context.quantity <= context.minThreshold * 0.5 ? 'critical' : 'high',
          recipients: recipients || [],
          source: {
            module: 'inventory',
            entityId: context.id,
            entityType: 'Inventory'
          },
          aiGenerated: true,
          actionRequired: true,
          actionText: 'Reorder Now',
          actionUrl: `/inventory/${context.id}/reorder`,
          aiInsights: {
            confidence: 0.9,
            reasoning: `Stock level (${context.quantity}) is below minimum threshold (${context.minThreshold})`,
            impact: 'high',
            urgency: context.quantity === 0 ? 'immediate' : 'high',
            suggestedActions: [
              'Reorder immediately',
              'Check supplier availability',
              'Consider alternative suppliers',
              'Update minimum threshold if needed'
            ]
          }
        });
        break;
        
      case 'equipment_maintenance':
        notification = new Notification({
          title: `Maintenance Required: ${context.name}`,
          message: `${context.name} requires maintenance based on AI analysis.`,
          type: 'equipment_maintenance',
          priority: context.utilizationRate > 80 ? 'high' : 'medium',
          recipients: recipients || [],
          source: {
            module: 'equipment',
            entityId: context.id,
            entityType: 'Equipment'
          },
          aiGenerated: true,
          actionRequired: true,
          actionText: 'Schedule Maintenance',
          actionUrl: `/equipment/${context.id}/maintenance`,
          aiInsights: {
            confidence: 0.8,
            reasoning: `Based on ${context.utilizationRate}% utilization rate and usage patterns`,
            impact: context.utilizationRate > 80 ? 'high' : 'medium',
            urgency: context.utilizationRate > 90 ? 'high' : 'medium',
            suggestedActions: [
              'Schedule preventive maintenance',
              'Check for wear and tear',
              'Prepare backup equipment',
              'Notify affected staff'
            ]
          }
        });
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid notification type' });
    }
    
    // Calculate priority based on AI insights
    notification.calculatePriority();
    
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ message: 'Error generating AI notification', error: err.message });
  }
});

// GET: Get notification statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [
                { $anyElementTrue: { $map: { input: '$recipients', as: 'r', in: { $eq: ['$$r.read', false] } } } },
                1,
                0
              ]
            }
          },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
          aiGenerated: { $sum: { $cond: ['$aiGenerated', 1, 0] } },
          resolved: { $sum: { $cond: ['$resolved', 1, 0] } }
        }
      }
    ]);
    
    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      overview: stats[0] || {
        total: 0, unread: 0, critical: 0, high: 0, medium: 0, low: 0, aiGenerated: 0, resolved: 0
      },
      byType: typeStats
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching statistics', error: err.message });
  }
});

module.exports = router;
