class AITaskOptimizer {
  constructor() {
    this.workloadPatterns = new Map();
    this.taskHistory = [];
  }

  // Analyze task completion patterns
  analyzeWorkloadPatterns(tasks, completionHistory = []) {
    const patterns = {
      timeOfDay: this.analyzeTimePatterns(completionHistory),
      taskTypes: this.analyzeTaskTypeEfficiency(tasks, completionHistory),
      workload: this.analyzeWorkloadDistribution(tasks),
      priority: this.analyzePriorityPatterns(tasks)
    };

    return patterns;
  }

  // AI-powered task scheduling optimization
  optimizeTaskSchedule(tasks) {
    const optimizedTasks = [...tasks];
    const currentHour = new Date().getHours();
    
    // Sort tasks by AI-calculated priority score
    optimizedTasks.sort((a, b) => {
      const scoreA = this.calculateTaskScore(a, currentHour);
      const scoreB = this.calculateTaskScore(b, currentHour);
      return scoreB - scoreA;
    });

    return optimizedTasks.map((task, index) => ({
      ...task,
      aiSuggestions: {
        optimalStartTime: this.suggestOptimalTime(task, currentHour),
        estimatedDuration: this.estimateTaskDuration(task),
        priorityScore: this.calculateTaskScore(task, currentHour),
        recommendedOrder: index + 1,
        reasoning: this.generateReasoningText(task, currentHour)
      }
    }));
  }

  // Calculate AI task priority score
  calculateTaskScore(task, currentHour) {
    let score = 0;

    // Priority weight (40% of score)
    const priorityWeights = { 'High': 40, 'Medium': 25, 'Low': 10 };
    score += priorityWeights[task.priority] || 15;

    // Time sensitivity (30% of score)
    const dueTime = this.parseTime(task.dueTime);
    const hoursUntilDue = dueTime - currentHour;
    if (hoursUntilDue <= 2) score += 30;
    else if (hoursUntilDue <= 4) score += 20;
    else if (hoursUntilDue <= 8) score += 10;

    // Task type efficiency (20% of score)
    const taskTypeScores = {
      'Kitchen prep': currentHour >= 8 && currentHour <= 11 ? 20 : 5,
      'Lunch service': currentHour >= 11 && currentHour <= 14 ? 20 : 2,
      'Inventory check': currentHour >= 14 && currentHour <= 17 ? 20 : 8,
      'Wedding setup': currentHour >= 16 && currentHour <= 20 ? 20 : 10,
      'Cleaning': currentHour >= 20 || currentHour <= 8 ? 20 : 5
    };
    
    const taskType = this.identifyTaskType(task.title);
    score += taskTypeScores[taskType] || 10;

    // Status penalty (10% of score)
    if (task.status === 'Completed') score -= 50;
    else if (task.status === 'In Progress') score += 10;

    return Math.max(0, score);
  }

  // Suggest optimal time for task execution
  suggestOptimalTime(task, currentHour) {
    const taskType = this.identifyTaskType(task.title);
    const optimalTimes = {
      'Kitchen prep': '9:00 AM',
      'Lunch service': '12:00 PM',
      'Inventory check': '3:00 PM',
      'Wedding setup': '5:00 PM',
      'Cleaning': '8:00 PM'
    };

    return optimalTimes[taskType] || this.formatTime(currentHour + 1);
  }

  // Estimate task duration using AI
  estimateTaskDuration(task) {
    const taskType = this.identifyTaskType(task.title);
    const baseDurations = {
      'Kitchen prep': 120, // 2 hours
      'Lunch service': 180, // 3 hours
      'Inventory check': 60, // 1 hour
      'Wedding setup': 240, // 4 hours
      'Cleaning': 90 // 1.5 hours
    };

    const baseDuration = baseDurations[taskType] || 60;
    
    // Adjust based on priority
    const priorityMultipliers = { 'High': 1.2, 'Medium': 1.0, 'Low': 0.8 };
    const multiplier = priorityMultipliers[task.priority] || 1.0;

    return Math.round(baseDuration * multiplier);
  }

  // Generate AI insights and recommendations
  generateInsights(tasks) {
    const insights = {
      workloadAnalysis: this.analyzeCurrentWorkload(tasks),
      recommendations: this.generateRecommendations(tasks),
      predictions: this.generatePredictions(tasks),
      alerts: this.generateAlerts(tasks)
    };

    return insights;
  }

  // Analyze current workload
  analyzeCurrentWorkload(tasks) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending' || !t.status).length;

    const workloadLevel = this.calculateWorkloadLevel(totalTasks, inProgressTasks, pendingTasks);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
      workloadLevel,
      efficiency: this.calculateEfficiencyScore(tasks)
    };
  }

  // Generate AI recommendations
  generateRecommendations(tasks) {
    const recommendations = [];
    const currentHour = new Date().getHours();

    // Workload recommendations
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
    if (pendingTasks > 5) {
      recommendations.push({
        type: 'workload',
        priority: 'high',
        message: 'High workload detected. Consider delegating tasks or extending deadlines.',
        action: 'redistribute_tasks'
      });
    }

    // Time-based recommendations
    if (currentHour >= 9 && currentHour <= 11) {
      const kitchenTasks = tasks.filter(t => 
        t.title.toLowerCase().includes('kitchen') || 
        t.title.toLowerCase().includes('prep')
      );
      if (kitchenTasks.length > 0) {
        recommendations.push({
          type: 'timing',
          priority: 'medium',
          message: 'Optimal time for kitchen preparation tasks.',
          action: 'prioritize_kitchen_tasks'
        });
      }
    }

    // Priority recommendations
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed');
    if (highPriorityTasks.length > 2) {
      recommendations.push({
        type: 'priority',
        priority: 'critical',
        message: 'Multiple high-priority tasks pending. Focus on critical items first.',
        action: 'focus_high_priority'
      });
    }

    return recommendations;
  }

  // Generate predictions
  generatePredictions(tasks) {
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const estimatedTimeToComplete = this.estimateCompletionTime(tasks);

    return {
      estimatedCompletionTime: estimatedTimeToComplete,
      completionProbability: Math.min(completionRate * 100 + 20, 95),
      bottleneckTasks: this.identifyBottlenecks(tasks),
      suggestedBreaks: this.suggestBreakTimes(tasks)
    };
  }

  // Generate alerts
  generateAlerts(tasks) {
    const alerts = [];
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    tasks.forEach(task => {
      const dueTime = this.parseTime(task.dueTime);
      const hoursUntilDue = dueTime - currentHour;

      if (hoursUntilDue <= 1 && task.status !== 'Completed') {
        alerts.push({
          type: 'urgent',
          taskId: task.id,
          message: `Task "${task.title}" is due in ${hoursUntilDue <= 0 ? 'now' : '1 hour'}!`,
          severity: 'critical'
        });
      } else if (hoursUntilDue <= 2 && task.priority === 'High' && task.status !== 'Completed') {
        alerts.push({
          type: 'warning',
          taskId: task.id,
          message: `High priority task "${task.title}" due soon.`,
          severity: 'high'
        });
      }
    });

    return alerts;
  }

  // Helper methods
  identifyTaskType(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('kitchen') || titleLower.includes('prep')) return 'Kitchen prep';
    if (titleLower.includes('lunch') || titleLower.includes('service')) return 'Lunch service';
    if (titleLower.includes('inventory') || titleLower.includes('stock')) return 'Inventory check';
    if (titleLower.includes('wedding') || titleLower.includes('setup')) return 'Wedding setup';
    if (titleLower.includes('clean')) return 'Cleaning';
    return 'General';
  }

  parseTime(timeStr) {
    if (!timeStr) return 17; // Default 5 PM
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours;
  }

  formatTime(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:00 ${period}`;
  }

  calculateWorkloadLevel(total, inProgress, pending) {
    const activeLoad = inProgress + pending;
    if (activeLoad <= 2) return 'Light';
    if (activeLoad <= 4) return 'Moderate';
    if (activeLoad <= 6) return 'Heavy';
    return 'Overloaded';
  }

  calculateEfficiencyScore(tasks) {
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const total = tasks.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  estimateCompletionTime(tasks) {
    const pendingTasks = tasks.filter(t => t.status !== 'Completed');
    const totalEstimatedMinutes = pendingTasks.reduce((sum, task) => {
      return sum + this.estimateTaskDuration(task);
    }, 0);
    
    const hours = Math.floor(totalEstimatedMinutes / 60);
    const minutes = totalEstimatedMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  identifyBottlenecks(tasks) {
    return tasks
      .filter(t => t.status === 'In Progress' && t.priority === 'High')
      .map(t => t.title);
  }

  suggestBreakTimes(tasks) {
    const workingHours = this.calculateWorkingHours(tasks);
    if (workingHours > 6) {
      return ['2:00 PM - 2:15 PM', '5:00 PM - 5:15 PM'];
    } else if (workingHours > 4) {
      return ['3:00 PM - 3:15 PM'];
    }
    return [];
  }

  calculateWorkingHours(tasks) {
    const totalMinutes = tasks.reduce((sum, task) => {
      return sum + this.estimateTaskDuration(task);
    }, 0);
    return Math.round(totalMinutes / 60);
  }

  generateReasoningText(task, currentHour) {
    const taskType = this.identifyTaskType(task.title);
    const dueTime = this.parseTime(task.dueTime);
    const hoursUntilDue = dueTime - currentHour;
    
    let reasoning = `Task type: ${taskType}. `;
    
    if (hoursUntilDue <= 2) {
      reasoning += 'High urgency due to approaching deadline. ';
    }
    
    if (task.priority === 'High') {
      reasoning += 'High priority task requiring immediate attention. ';
    }
    
    reasoning += `Optimal execution time based on task type and current workload patterns.`;
    
    return reasoning;
  }

  // Additional helper methods for pattern analysis
  analyzeTimePatterns(completionHistory) {
    // Analyze when tasks are typically completed most efficiently
    const hourlyEfficiency = new Array(24).fill(0);
    completionHistory.forEach(record => {
      const hour = new Date(record.completedAt).getHours();
      hourlyEfficiency[hour] += record.efficiency || 1;
    });
    
    return {
      peakHours: this.findPeakHours(hourlyEfficiency),
      lowEfficiencyHours: this.findLowEfficiencyHours(hourlyEfficiency)
    };
  }

  analyzeTaskTypeEfficiency(tasks, completionHistory) {
    const typeEfficiency = {};
    completionHistory.forEach(record => {
      const type = this.identifyTaskType(record.taskTitle);
      if (!typeEfficiency[type]) typeEfficiency[type] = [];
      typeEfficiency[type].push(record.efficiency || 1);
    });
    
    return typeEfficiency;
  }

  analyzeWorkloadDistribution(tasks) {
    const distribution = {
      byPriority: { High: 0, Medium: 0, Low: 0 },
      byStatus: { Completed: 0, 'In Progress': 0, Pending: 0 },
      byType: {}
    };
    
    tasks.forEach(task => {
      distribution.byPriority[task.priority] = (distribution.byPriority[task.priority] || 0) + 1;
      distribution.byStatus[task.status] = (distribution.byStatus[task.status] || 0) + 1;
      
      const type = this.identifyTaskType(task.title);
      distribution.byType[type] = (distribution.byType[type] || 0) + 1;
    });
    
    return distribution;
  }

  analyzePriorityPatterns(tasks) {
    const patterns = {
      highPriorityCompletion: 0,
      averageCompletionTime: {},
      priorityDistribution: { High: 0, Medium: 0, Low: 0 }
    };
    
    tasks.forEach(task => {
      patterns.priorityDistribution[task.priority] = (patterns.priorityDistribution[task.priority] || 0) + 1;
    });
    
    return patterns;
  }

  findPeakHours(hourlyData) {
    const maxEfficiency = Math.max(...hourlyData);
    return hourlyData
      .map((efficiency, hour) => ({ hour, efficiency }))
      .filter(item => item.efficiency >= maxEfficiency * 0.8)
      .map(item => item.hour);
  }

  findLowEfficiencyHours(hourlyData) {
    const avgEfficiency = hourlyData.reduce((sum, val) => sum + val, 0) / hourlyData.length;
    return hourlyData
      .map((efficiency, hour) => ({ hour, efficiency }))
      .filter(item => item.efficiency < avgEfficiency * 0.5)
      .map(item => item.hour);
  }
}

module.exports = new AITaskOptimizer();
