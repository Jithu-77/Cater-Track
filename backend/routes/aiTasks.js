const express = require('express');
const router = express.Router();
const aiTaskOptimizer = require('../services/aiTaskOptimizer');

// POST: Optimize task schedule using AI
router.post('/optimize', async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required'
      });
    }

    const optimizedTasks = aiTaskOptimizer.optimizeTaskSchedule(tasks);
    
    res.json({
      success: true,
      data: {
        optimizedTasks,
        totalTasks: tasks.length,
        optimizationApplied: true
      }
    });
  } catch (error) {
    console.error('Error optimizing tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize tasks',
      error: error.message
    });
  }
});

// POST: Get AI insights for current workload
router.post('/insights', async (req, res) => {
  try {
    const { tasks, completionHistory = [] } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required'
      });
    }

    const insights = aiTaskOptimizer.generateInsights(tasks);
    const patterns = aiTaskOptimizer.analyzeWorkloadPatterns(tasks, completionHistory);
    
    res.json({
      success: true,
      data: {
        insights,
        patterns,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI insights',
      error: error.message
    });
  }
});

// POST: Get task recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { tasks, currentContext = {} } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required'
      });
    }

    const recommendations = aiTaskOptimizer.generateRecommendations(tasks);
    const alerts = aiTaskOptimizer.generateAlerts(tasks);
    const predictions = aiTaskOptimizer.generatePredictions(tasks);
    
    res.json({
      success: true,
      data: {
        recommendations,
        alerts,
        predictions,
        context: currentContext,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
});

// POST: Calculate task priority score
router.post('/priority-score', async (req, res) => {
  try {
    const { task } = req.body;
    
    if (!task) {
      return res.status(400).json({
        success: false,
        message: 'Task object is required'
      });
    }

    const currentHour = new Date().getHours();
    const priorityScore = aiTaskOptimizer.calculateTaskScore(task, currentHour);
    const optimalTime = aiTaskOptimizer.suggestOptimalTime(task, currentHour);
    const estimatedDuration = aiTaskOptimizer.estimateTaskDuration(task);
    
    res.json({
      success: true,
      data: {
        priorityScore,
        optimalTime,
        estimatedDuration,
        reasoning: aiTaskOptimizer.generateReasoningText(task, currentHour),
        calculatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error calculating priority score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate priority score',
      error: error.message
    });
  }
});

// GET: Get AI task analytics
router.get('/analytics', async (req, res) => {
  try {
    // This would typically fetch from database
    // For now, return sample analytics data
    const analytics = {
      totalOptimizations: 156,
      averageEfficiencyGain: 23.5,
      tasksOptimizedToday: 12,
      topRecommendations: [
        'Prioritize kitchen prep tasks in morning hours',
        'Schedule inventory checks during low-activity periods',
        'Batch similar tasks together for efficiency'
      ],
      efficiencyTrends: {
        daily: [85, 78, 92, 88, 95, 82, 90],
        weekly: [87, 89, 91, 85, 93, 88, 90],
        monthly: [88, 85, 92, 89, 91, 87, 94, 90, 93, 88, 91, 89]
      },
      taskTypePerformance: {
        'Kitchen prep': { efficiency: 92, avgDuration: 120 },
        'Lunch service': { efficiency: 88, avgDuration: 180 },
        'Inventory check': { efficiency: 95, avgDuration: 60 },
        'Wedding setup': { efficiency: 85, avgDuration: 240 },
        'Cleaning': { efficiency: 90, avgDuration: 90 }
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// POST: Simulate task optimization (for demo purposes)
router.post('/simulate', async (req, res) => {
  try {
    const { scenario = 'default' } = req.body;
    
    // Sample tasks for simulation
    const sampleTasks = [
      {
        id: 1,
        title: 'Kitchen prep for lunch service',
        priority: 'High',
        dueTime: '11:00 AM',
        status: 'Pending'
      },
      {
        id: 2,
        title: 'Inventory check - vegetables',
        priority: 'Medium',
        dueTime: '3:00 PM',
        status: 'Pending'
      },
      {
        id: 3,
        title: 'Wedding setup - Grand Hall',
        priority: 'High',
        dueTime: '5:00 PM',
        status: 'In Progress'
      },
      {
        id: 4,
        title: 'Clean kitchen equipment',
        priority: 'Low',
        dueTime: '8:00 PM',
        status: 'Pending'
      },
      {
        id: 5,
        title: 'Prepare catering supplies',
        priority: 'Medium',
        dueTime: '2:00 PM',
        status: 'Pending'
      }
    ];

    const optimizedTasks = aiTaskOptimizer.optimizeTaskSchedule(sampleTasks);
    const insights = aiTaskOptimizer.generateInsights(sampleTasks);
    const recommendations = aiTaskOptimizer.generateRecommendations(sampleTasks);
    
    res.json({
      success: true,
      data: {
        scenario,
        originalTasks: sampleTasks,
        optimizedTasks,
        insights,
        recommendations,
        simulationResults: {
          efficiencyGain: '28%',
          timesSaved: '45 minutes',
          priorityAdjustments: 3,
          scheduleOptimizations: 5
        }
      }
    });
  } catch (error) {
    console.error('Error running simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run simulation',
      error: error.message
    });
  }
});

module.exports = router;
