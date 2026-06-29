const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'inventory_alert',
      'equipment_maintenance',
      'vehicle_alert',
      'employee_alert',
      'booking_update',
      'system_alert',
      'ai_recommendation',
      'performance_insight',
      'cost_optimization',
      'task_reminder',
      'system_update',
      'maintenance_alert',
      'general'
    ],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  recipients: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer']
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date
  }],
  source: {
    module: String,
    entityId: String,
    entityType: String
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionText: String,
  actionUrl: String,
  aiInsights: {
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    reasoning: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'immediate']
    },
    suggestedActions: [String]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    actions: {
      type: Number,
      default: 0
    },
    effectiveness: {
      type: Number,
      default: 0
    }
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: Date
}, { 
  timestamps: true 
});

// Index for efficient queries
NotificationSchema.index({ type: 1, priority: 1, createdAt: -1 });
NotificationSchema.index({ 'recipients.userId': 1, 'recipients.read': 1 });
NotificationSchema.index({ resolved: 1, expiresAt: 1 });

// Methods
NotificationSchema.methods.calculatePriority = function() {
  if (this.aiInsights && this.aiInsights.urgency && this.aiInsights.impact) {
    const urgencyScore = {
      'immediate': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    }[this.aiInsights.urgency] || 2;

    const impactScore = {
      'high': 3,
      'medium': 2,
      'low': 1
    }[this.aiInsights.impact] || 2;

    const totalScore = urgencyScore + impactScore;
    
    if (totalScore >= 6) this.priority = 'critical';
    else if (totalScore >= 5) this.priority = 'high';
    else if (totalScore >= 3) this.priority = 'medium';
    else this.priority = 'low';
  }
  
  return this.priority;
};

NotificationSchema.methods.markAsRead = function(userId) {
  const recipient = this.recipients.find(r => 
    r.userId && r.userId.toString() === userId.toString()
  );
  
  if (recipient && !recipient.read) {
    recipient.read = true;
    recipient.readAt = new Date();
    this.analytics.views += 1;
  }
  
  return this.save();
};

NotificationSchema.methods.trackEffectiveness = function() {
  const totalRecipients = this.recipients.length;
  const readCount = this.recipients.filter(r => r.read).length;
  const readRate = totalRecipients > 0 ? readCount / totalRecipients : 0;
  const clickRate = this.analytics.views > 0 ? this.analytics.clicks / this.analytics.views : 0;
  const actionRate = this.analytics.clicks > 0 ? this.analytics.actions / this.analytics.clicks : 0;
  
  // Calculate effectiveness score (0-100)
  this.analytics.effectiveness = Math.round(
    (readRate * 0.4 + clickRate * 0.3 + actionRate * 0.3) * 100
  );
  
  return this.analytics.effectiveness;
};

NotificationSchema.methods.resolve = function(userId) {
  this.resolved = true;
  this.resolvedAt = new Date();
  if (userId) {
    this.resolvedBy = userId;
  }
  return this.save();
};

// Static methods
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    'recipients.userId': userId,
    'recipients.read': false,
    resolved: false
  });
};

NotificationSchema.statics.getByPriority = function(priority, limit = 10) {
  return this.find({ priority, resolved: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('recipients.userId', 'name email');
};

NotificationSchema.statics.getAnalytics = function(dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: {
            $cond: [
              { $eq: ['$resolved', false] },
              1,
              0
            ]
          }
        },
        critical: {
          $sum: {
            $cond: [
              { $eq: ['$priority', 'critical'] },
              1,
              0
            ]
          }
        },
        high: {
          $sum: {
            $cond: [
              { $eq: ['$priority', 'high'] },
              1,
              0
            ]
          }
        },
        medium: {
          $sum: {
            $cond: [
              { $eq: ['$priority', 'medium'] },
              1,
              0
            ]
          }
        },
        low: {
          $sum: {
            $cond: [
              { $eq: ['$priority', 'low'] },
              1,
              0
            ]
          }
        },
        aiGenerated: {
          $sum: {
            $cond: [
              { $eq: ['$aiGenerated', true] },
              1,
              0
            ]
          }
        },
        resolved: {
          $sum: {
            $cond: [
              { $eq: ['$resolved', true] },
              1,
              0
            ]
          }
        },
        avgEffectiveness: { $avg: '$analytics.effectiveness' }
      }
    }
  ]);
};

// Auto-expire notifications
NotificationSchema.pre('save', function(next) {
  if (!this.expiresAt && this.type !== 'system_update') {
    // Set expiration based on priority
    const expirationDays = {
      'critical': 7,
      'high': 14,
      'medium': 30,
      'low': 60
    }[this.priority] || 30;
    
    this.expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
