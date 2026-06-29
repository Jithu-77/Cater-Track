const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  client: {
    type: String,
    required: true,
    trim: true
  },
  event: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Paid', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  guests: {
    type: Number,
    default: 0,
    min: 0
  },
  menu: {
    type: String,
    default: 'Mixed'
  },
  location: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Generate orderId before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    try {
      const count = await this.constructor.countDocuments();
      this.orderId = `ORD${String(count + 1).padStart(3, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to get order statistics
orderSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        averageOrderValue: { $avg: '$amount' },
        pendingOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0]
          }
        },
        confirmedOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0]
          }
        },
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
          }
        },
        cancelledOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  const recentOrders = await this.find()
    .sort({ createdAt: -1 })
    .limit(5);
  
  return {
    ...(stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    }),
    statusBreakdown: {
      pending: stats[0]?.pendingOrders || 0,
      confirmed: stats[0]?.confirmedOrders || 0,
      completed: stats[0]?.completedOrders || 0,
      cancelled: stats[0]?.cancelledOrders || 0
    },
    recentOrders
  };
};

module.exports = mongoose.model('Order', orderSchema);
