const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');

class AIInventoryMonitor {
  constructor() {
    this.monitoringInterval = null;
    this.checkIntervalMinutes = 30; // Check every 30 minutes
    this.notificationCooldown = new Map(); // Prevent spam notifications
    this.cooldownPeriod = 2 * 60 * 60 * 1000; // 2 hours cooldown
  }

  // Start the AI monitoring system
  startMonitoring() {
    console.log('🤖 AI Inventory Monitor started');
    
    // Run initial check
    this.performInventoryCheck();
    
    // Set up recurring checks
    this.monitoringInterval = setInterval(() => {
      this.performInventoryCheck();
    }, this.checkIntervalMinutes * 60 * 1000);
  }

  // Stop the monitoring system
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🤖 AI Inventory Monitor stopped');
    }
  }

  // Main inventory checking function
  async performInventoryCheck() {
    try {
      console.log('🔍 AI Inventory Monitor: Performing stock level check...');
      
      const inventoryItems = await Inventory.find({});
      const alerts = [];
      
      for (const item of inventoryItems) {
        // Update AI insights for each item
        await this.updateItemAIInsights(item);
        
        // Check for various alert conditions
        const itemAlerts = await this.checkItemAlerts(item);
        alerts.push(...itemAlerts);
      }
      
      // Process and send notifications
      if (alerts.length > 0) {
        await this.processAlerts(alerts);
        console.log(`📢 AI Inventory Monitor: Generated ${alerts.length} alerts`);
      } else {
        console.log('✅ AI Inventory Monitor: All inventory levels are optimal');
      }
      
    } catch (error) {
      console.error('❌ AI Inventory Monitor Error:', error);
    }
  }

  // Update AI insights for an inventory item
  async updateItemAIInsights(item) {
    try {
      // Calculate demand patterns
      item.calculateDemandPattern();
      
      // Predict future demand
      item.predictFutureDemand();
      
      // Optimize stock levels
      item.optimizeStockLevels();
      
      // Calculate wastage risk
      this.calculateWastageRisk(item);
      
      // Generate AI recommendations
      this.generateAIRecommendations(item);
      
      // Save updated insights
      await item.save();
      
    } catch (error) {
      console.error(`Error updating AI insights for ${item.name}:`, error);
    }
  }

  // Check for various alert conditions
  async checkItemAlerts(item) {
    const alerts = [];
    const currentTime = Date.now();
    
    // Check if we're in cooldown period for this item
    const lastNotification = this.notificationCooldown.get(item._id.toString());
    if (lastNotification && (currentTime - lastNotification) < this.cooldownPeriod) {
      return alerts; // Skip if in cooldown
    }

    // 1. Low Stock Alert
    if (item.quantity <= item.minThreshold) {
      const severity = item.quantity === 0 ? 'critical' : 
                     item.quantity <= item.minThreshold * 0.5 ? 'high' : 'medium';
      
      alerts.push({
        type: 'low_stock',
        severity,
        item,
        message: item.quantity === 0 ? 
          `${item.name} is completely out of stock!` :
          `${item.name} is running low with only ${item.quantity} ${item.unit} remaining.`,
        aiInsights: {
          confidence: 0.95,
          reasoning: `Current stock (${item.quantity}) is ${item.quantity === 0 ? 'at zero' : 'below minimum threshold (' + item.minThreshold + ')'}`,
          impact: severity === 'critical' ? 'high' : 'medium',
          urgency: severity === 'critical' ? 'immediate' : 'high',
          suggestedActions: this.generateLowStockActions(item)
        }
      });
    }

    // 2. Predicted Stock Depletion Alert
    if (item.predictedDemand && item.predictedDemand.nextWeek > 0) {
      const daysUntilDepletion = Math.floor(item.quantity / (item.predictedDemand.nextWeek / 7));
      
      if (daysUntilDepletion <= 3 && daysUntilDepletion > 0) {
        alerts.push({
          type: 'predicted_depletion',
          severity: daysUntilDepletion <= 1 ? 'high' : 'medium',
          item,
          message: `AI predicts ${item.name} will run out in ${daysUntilDepletion} day(s) based on usage patterns.`,
          aiInsights: {
            confidence: item.predictedDemand.confidence || 0.8,
            reasoning: `Based on predicted weekly demand of ${item.predictedDemand.nextWeek} ${item.unit}`,
            impact: 'medium',
            urgency: daysUntilDepletion <= 1 ? 'high' : 'medium',
            suggestedActions: [
              'Place order immediately',
              'Check supplier lead times',
              'Consider emergency suppliers'
            ]
          }
        });
      }
    }

    // 3. Expiry Warning Alert
    if (item.expiryDate) {
      const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        alerts.push({
          type: 'expiry_warning',
          severity: daysUntilExpiry <= 2 ? 'high' : 'medium',
          item,
          message: `${item.name} will expire in ${daysUntilExpiry} day(s). Consider using soon or marking down.`,
          aiInsights: {
            confidence: 1.0,
            reasoning: `Expiry date is ${item.expiryDate.toDateString()}`,
            impact: 'medium',
            urgency: daysUntilExpiry <= 2 ? 'high' : 'medium',
            suggestedActions: [
              'Use in upcoming events',
              'Offer at discounted price',
              'Check if can be donated',
              'Plan menu around expiring items'
            ]
          }
        });
      }
    }

    // 4. Overstock Alert
    if (item.quantity > item.maxThreshold) {
      alerts.push({
        type: 'overstock',
        severity: 'low',
        item,
        message: `${item.name} is overstocked with ${item.quantity} ${item.unit}. Consider reducing orders.`,
        aiInsights: {
          confidence: 0.8,
          reasoning: `Current stock (${item.quantity}) exceeds maximum threshold (${item.maxThreshold})`,
          impact: 'low',
          urgency: 'low',
          suggestedActions: [
            'Reduce next order quantity',
            'Use in promotional menus',
            'Check for bulk discount opportunities'
          ]
        }
      });
    }

    // 5. High Wastage Risk Alert
    if (item.aiInsights && item.aiInsights.wastageRisk > 0.7) {
      alerts.push({
        type: 'wastage_risk',
        severity: 'medium',
        item,
        message: `${item.name} has high wastage risk. AI recommends immediate action.`,
        aiInsights: {
          confidence: 0.85,
          reasoning: `Wastage risk score: ${Math.round(item.aiInsights.wastageRisk * 100)}%`,
          impact: 'medium',
          urgency: 'medium',
          suggestedActions: item.aiInsights.recommendedActions || [
            'Use in upcoming events',
            'Create special menu items',
            'Check storage conditions'
          ]
        }
      });
    }

    return alerts;
  }

  // Process and send notifications for alerts
  async processAlerts(alerts) {
    const groupedAlerts = this.groupAlertsByPriority(alerts);
    
    for (const [priority, alertGroup] of Object.entries(groupedAlerts)) {
      if (alertGroup.length === 0) continue;
      
      // Create batch notification for similar alerts
      if (alertGroup.length > 1) {
        await this.createBatchNotification(priority, alertGroup);
      } else {
        await this.createSingleNotification(alertGroup[0]);
      }
      
      // Update cooldown for processed items
      alertGroup.forEach(alert => {
        this.notificationCooldown.set(alert.item._id.toString(), Date.now());
      });
    }
  }

  // Create a single notification for one alert
  async createSingleNotification(alert) {
    try {
      const notification = new Notification({
        title: this.getAlertTitle(alert),
        message: alert.message,
        type: 'inventory_alert',
        priority: this.mapSeverityToPriority(alert.severity),
        recipients: [
          { role: 'admin' },
          { role: 'staff' }
        ],
        source: {
          module: 'inventory',
          entityId: alert.item._id.toString(),
          entityType: 'Inventory'
        },
        aiGenerated: true,
        actionRequired: true,
        actionText: this.getActionText(alert.type),
        actionUrl: `/inventory/${alert.item._id}`,
        aiInsights: alert.aiInsights
      });

      // Auto-calculate priority based on AI insights
      notification.calculatePriority();
      
      await notification.save();
      console.log(`📢 Created notification: ${notification.title}`);
      
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Create batch notification for multiple similar alerts
  async createBatchNotification(priority, alerts) {
    try {
      const alertTypes = [...new Set(alerts.map(a => a.type))];
      const itemNames = alerts.map(a => a.item.name).join(', ');
      
      const notification = new Notification({
        title: `Multiple Inventory Alerts (${alerts.length} items)`,
        message: `AI detected ${alerts.length} inventory issues: ${itemNames}. Immediate attention required.`,
        type: 'inventory_alert',
        priority: this.mapSeverityToPriority(priority),
        recipients: [
          { role: 'admin' },
          { role: 'staff' }
        ],
        source: {
          module: 'inventory',
          entityId: 'batch',
          entityType: 'InventoryBatch'
        },
        aiGenerated: true,
        actionRequired: true,
        actionText: 'Review Inventory',
        actionUrl: '/inventory',
        aiInsights: {
          confidence: 0.9,
          reasoning: `Batch alert for ${alertTypes.join(', ')} issues`,
          impact: priority === 'critical' ? 'high' : 'medium',
          urgency: priority === 'critical' ? 'immediate' : 'high',
          suggestedActions: [
            'Review all flagged items',
            'Prioritize critical items',
            'Update reorder points',
            'Check supplier availability'
          ]
        }
      });

      notification.calculatePriority();
      await notification.save();
      console.log(`📢 Created batch notification for ${alerts.length} items`);
      
    } catch (error) {
      console.error('Error creating batch notification:', error);
    }
  }

  // Helper methods
  calculateWastageRisk(item) {
    let risk = 0;
    
    // Factor 1: Expiry date proximity (40%)
    if (item.expiryDate) {
      const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 7) risk += 0.4;
      else if (daysUntilExpiry <= 14) risk += 0.2;
    }
    
    // Factor 2: Overstock situation (30%)
    if (item.quantity > item.maxThreshold) {
      const overstockRatio = item.quantity / item.maxThreshold;
      risk += Math.min(0.3, (overstockRatio - 1) * 0.3);
    }
    
    // Factor 3: Low demand trend (30%)
    if (item.demandPattern && item.demandPattern.daily) {
      const avgDailyUsage = item.demandPattern.daily.reduce((sum, usage) => sum + usage, 0) / 7;
      if (avgDailyUsage < 1) risk += 0.3;
      else if (avgDailyUsage < 3) risk += 0.15;
    }
    
    item.aiInsights = item.aiInsights || {};
    item.aiInsights.wastageRisk = Math.min(1, risk);
  }

  generateAIRecommendations(item) {
    const recommendations = [];
    
    if (item.quantity <= item.minThreshold) {
      recommendations.push('Reorder immediately');
      recommendations.push('Check supplier lead times');
    }
    
    if (item.aiInsights && item.aiInsights.wastageRisk > 0.5) {
      recommendations.push('Use in upcoming events');
      recommendations.push('Consider promotional pricing');
    }
    
    if (item.quantity > item.maxThreshold) {
      recommendations.push('Reduce next order quantity');
      recommendations.push('Create special menu items');
    }
    
    item.aiInsights = item.aiInsights || {};
    item.aiInsights.recommendedActions = recommendations;
  }

  generateLowStockActions(item) {
    const actions = ['Reorder immediately'];
    
    if (item.cost && item.cost.supplier) {
      actions.push(`Contact supplier: ${item.cost.supplier}`);
    } else {
      actions.push('Check supplier availability');
    }
    
    if (item.quantity === 0) {
      actions.push('Find emergency supplier');
      actions.push('Adjust menu if necessary');
    } else {
      actions.push('Consider alternative suppliers');
    }
    
    actions.push('Update minimum threshold if needed');
    return actions;
  }

  groupAlertsByPriority(alerts) {
    return alerts.reduce((groups, alert) => {
      const priority = alert.severity;
      if (!groups[priority]) groups[priority] = [];
      groups[priority].push(alert);
      return groups;
    }, {});
  }

  getAlertTitle(alert) {
    const titles = {
      low_stock: `Low Stock Alert: ${alert.item.name}`,
      predicted_depletion: `Stock Depletion Predicted: ${alert.item.name}`,
      expiry_warning: `Expiry Warning: ${alert.item.name}`,
      overstock: `Overstock Alert: ${alert.item.name}`,
      wastage_risk: `Wastage Risk Alert: ${alert.item.name}`
    };
    return titles[alert.type] || `Inventory Alert: ${alert.item.name}`;
  }

  getActionText(alertType) {
    const actions = {
      low_stock: 'Reorder Now',
      predicted_depletion: 'Place Order',
      expiry_warning: 'Use Soon',
      overstock: 'Review Stock',
      wastage_risk: 'Take Action'
    };
    return actions[alertType] || 'Review Item';
  }

  mapSeverityToPriority(severity) {
    const mapping = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low'
    };
    return mapping[severity] || 'medium';
  }

  // Manual trigger for immediate check
  async triggerImmediateCheck() {
    console.log('🚨 Manual inventory check triggered');
    await this.performInventoryCheck();
  }

  // Get monitoring status
  getStatus() {
    return {
      isRunning: this.monitoringInterval !== null,
      checkInterval: this.checkIntervalMinutes,
      cooldownPeriod: this.cooldownPeriod / (60 * 1000), // in minutes
      activeItems: this.notificationCooldown.size
    };
  }
}

module.exports = new AIInventoryMonitor();
