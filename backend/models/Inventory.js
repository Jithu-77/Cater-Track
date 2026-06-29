const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  minThreshold: {
    type: Number,
    default: 10
  },
  maxThreshold: {
    type: Number,
    default: 100
  },
  cost: {
    unitCost: Number,
    totalCost: Number,
    supplier: String,
  },
  location: {
    warehouse: String,
    section: String,
    shelf: String,
  },
  expiryDate: Date,
  batchNumber: String,
  usageHistory: [{
    date: Date,
    quantityUsed: Number,
    purpose: String,
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  }],
  restockHistory: [{
    date: Date,
    quantityAdded: Number,
    supplier: String,
    cost: Number,
    batchNumber: String,
  }],
  // AI/ML Fields
  demandPattern: {
    daily: [Number], // 7 days
    weekly: [Number], // 4 weeks
    monthly: [Number], // 12 months
    seasonal: String,
  },
  predictedDemand: {
    nextWeek: Number,
    nextMonth: Number,
    confidence: Number, // 0-1
  },
  aiInsights: {
    optimalStockLevel: Number,
    reorderPoint: Number,
    wastageRisk: Number, // 0-1
    costOptimization: String,
    seasonalTrends: [String],
    recommendedActions: [String],
  },
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'expiry_warning', 'overstock', 'wastage_risk', 'reorder_suggestion']
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    createdAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// AI/ML Methods
InventorySchema.methods.calculateDemandPattern = function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentUsage = this.usageHistory.filter(usage =>
    new Date(usage.date) >= thirtyDaysAgo
  );

  // Calculate daily pattern (last 7 days)
  const dailyUsage = new Array(7).fill(0);
  recentUsage.forEach(usage => {
    const dayOfWeek = new Date(usage.date).getDay();
    dailyUsage[dayOfWeek] += usage.quantityUsed;
  });

  this.demandPattern.daily = dailyUsage;
  return this.demandPattern;
};

InventorySchema.methods.predictFutureDemand = function() {
  const avgDailyUsage = this.demandPattern.daily.reduce((sum, usage) => sum + usage, 0) / 7;
  const avgWeeklyUsage = avgDailyUsage * 7;

  // Simple linear prediction with seasonal adjustment
  const seasonalMultiplier = this.getSeasonalMultiplier();

  this.predictedDemand.nextWeek = Math.round(avgWeeklyUsage * seasonalMultiplier);
  this.predictedDemand.nextMonth = Math.round(avgWeeklyUsage * 4 * seasonalMultiplier);
  this.predictedDemand.confidence = this.calculatePredictionConfidence();

  return this.predictedDemand;
};

InventorySchema.methods.getSeasonalMultiplier = function() {
  const month = new Date().getMonth();
  // Adjust based on catering seasonal patterns
  const seasonalFactors = [0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.2, 1.1, 1.0, 1.1, 1.2, 1.5]; // Dec is highest
  return seasonalFactors[month];
};

InventorySchema.methods.optimizeStockLevels = function() {
  const avgDailyUsage = this.demandPattern.daily.reduce((sum, usage) => sum + usage, 0) / 7;
  const leadTime = 3; // days
  const safetyStock = avgDailyUsage * 2; // 2 days safety stock

  this.aiInsights.reorderPoint = Math.round((avgDailyUsage * leadTime) + safetyStock);
  this.aiInsights.optimalStockLevel = Math.round(this.aiInsights.reorderPoint * 2);

  return this.aiInsights;
};

InventorySchema.methods.calculatePredictionConfidence = function() {
  let confidence = 0.5; // Base confidence

  // Increase confidence based on usage history length
  const historyLength = this.usageHistory.length;
  if (historyLength >= 10) confidence += 0.3;
  else if (historyLength >= 5) confidence += 0.2;
  else if (historyLength >= 2) confidence += 0.1;

  // Increase confidence if demand pattern is consistent
  if (this.demandPattern && this.demandPattern.daily) {
    const dailyUsage = this.demandPattern.daily;
    const avgUsage = dailyUsage.reduce((sum, usage) => sum + usage, 0) / dailyUsage.length;
    const variance = dailyUsage.reduce((sum, usage) => sum + Math.pow(usage - avgUsage, 2), 0) / dailyUsage.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower variance = higher confidence
    if (standardDeviation < avgUsage * 0.2) confidence += 0.2;
    else if (standardDeviation < avgUsage * 0.5) confidence += 0.1;
  }

  return Math.min(0.95, confidence);
};

InventorySchema.methods.generateAlerts = function() {
  const alerts = [];

  // Low stock alert
  if (this.quantity <= this.minThreshold) {
    alerts.push({
      type: 'low_stock',
      message: `${this.name} is running low (${this.quantity} ${this.unit} remaining)`,
      severity: this.quantity <= this.minThreshold * 0.5 ? 'critical' : 'high'
    });
  }

  // Expiry warning
  if (this.expiryDate) {
    const daysToExpiry = Math.ceil((new Date(this.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysToExpiry <= 7 && daysToExpiry > 0) {
      alerts.push({
        type: 'expiry_warning',
        message: `${this.name} expires in ${daysToExpiry} days`,
        severity: daysToExpiry <= 3 ? 'critical' : 'high'
      });
    }
  }

  // Overstock alert
  if (this.quantity > this.maxThreshold) {
    alerts.push({
      type: 'overstock',
      message: `${this.name} is overstocked (${this.quantity} ${this.unit})`,
      severity: 'medium'
    });
  }

  return alerts;
};

module.exports = mongoose.model('Inventory', InventorySchema);
