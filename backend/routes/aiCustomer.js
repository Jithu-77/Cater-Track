const express = require('express');
const router = express.Router();
const aiCustomerAssistant = require('../services/aiCustomerAssistant');

// POST: Get AI menu recommendations
router.post('/menu-recommendations', async (req, res) => {
  try {
    const { customerProfile = {}, eventDetails } = req.body;
    
    if (!eventDetails || !eventDetails.eventType || !eventDetails.guests || !eventDetails.budget) {
      return res.status(400).json({
        success: false,
        message: 'Event details (eventType, guests, budget) are required'
      });
    }

    const recommendations = aiCustomerAssistant.generateMenuRecommendations(
      customerProfile, 
      eventDetails
    );
    
    res.json({
      success: true,
      data: {
        ...recommendations,
        eventDetails,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating menu recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate menu recommendations',
      error: error.message
    });
  }
});

// POST: Get AI event planning insights
router.post('/event-planning', async (req, res) => {
  try {
    const { eventDetails, customerHistory = [] } = req.body;
    
    if (!eventDetails || !eventDetails.eventType || !eventDetails.guests || !eventDetails.budget) {
      return res.status(400).json({
        success: false,
        message: 'Event details (eventType, guests, budget, date) are required'
      });
    }

    const insights = aiCustomerAssistant.generateEventPlanningInsights(
      eventDetails, 
      customerHistory
    );
    
    res.json({
      success: true,
      data: {
        insights,
        eventDetails,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating event planning insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate event planning insights',
      error: error.message
    });
  }
});

// POST: Get smart catering suggestions
router.post('/smart-suggestions', async (req, res) => {
  try {
    const { customerProfile = {}, currentOrder = {} } = req.body;
    
    const suggestions = aiCustomerAssistant.generateSmartSuggestions(
      customerProfile, 
      currentOrder
    );
    
    res.json({
      success: true,
      data: {
        suggestions,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating smart suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate smart suggestions',
      error: error.message
    });
  }
});

// POST: Get budget optimization suggestions
router.post('/budget-optimization', async (req, res) => {
  try {
    const { budget, guests, eventType } = req.body;
    
    if (!budget || !guests || !eventType) {
      return res.status(400).json({
        success: false,
        message: 'Budget, guests, and eventType are required'
      });
    }

    const optimizations = aiCustomerAssistant.generateCostOptimizations(
      budget, 
      guests, 
      eventType
    );
    
    const budgetAnalysis = aiCustomerAssistant.analyzeBudget(budget, guests, eventType);
    
    res.json({
      success: true,
      data: {
        optimizations,
        budgetAnalysis,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating budget optimization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate budget optimization',
      error: error.message
    });
  }
});

// GET: Get AI-powered demo recommendations
router.get('/demo-recommendations', async (req, res) => {
  try {
    // Sample customer profile and event details for demo
    const sampleCustomerProfile = {
      name: 'Rajesh Kumar',
      preferences: { vegetarian: false },
      orderHistory: [
        { event: 'Birthday Party', menu: 'Paneer Tikka, Butter Chicken, Gulab Jamun', guests: 50 },
        { event: 'Anniversary', menu: 'Samosa, Dal Makhani, Rasgulla', guests: 30 }
      ]
    };

    const sampleEventDetails = {
      eventType: 'Wedding',
      guests: 200,
      budget: 150000,
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      preferences: { vegetarian: false }
    };

    // Generate all AI recommendations
    const menuRecommendations = aiCustomerAssistant.generateMenuRecommendations(
      sampleCustomerProfile, 
      sampleEventDetails
    );

    const eventInsights = aiCustomerAssistant.generateEventPlanningInsights(
      sampleEventDetails, 
      sampleCustomerProfile.orderHistory
    );

    const smartSuggestions = aiCustomerAssistant.generateSmartSuggestions(
      sampleCustomerProfile, 
      sampleEventDetails
    );

    const budgetOptimizations = aiCustomerAssistant.generateCostOptimizations(
      sampleEventDetails.budget, 
      sampleEventDetails.guests, 
      sampleEventDetails.eventType
    );

    res.json({
      success: true,
      data: {
        customerProfile: sampleCustomerProfile,
        eventDetails: sampleEventDetails,
        menuRecommendations,
        eventInsights,
        smartSuggestions,
        budgetOptimizations,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating demo recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate demo recommendations',
      error: error.message
    });
  }
});

// POST: Get personalized menu for specific dietary preferences
router.post('/personalized-menu', async (req, res) => {
  try {
    const { preferences = {}, budget, guests } = req.body;
    
    if (!budget || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Budget and guests are required'
      });
    }

    const eventDetails = {
      eventType: 'birthday', // Default event type
      guests,
      budget,
      preferences
    };

    const menuRecommendations = aiCustomerAssistant.generateMenuRecommendations(
      { preferences }, 
      eventDetails
    );
    
    res.json({
      success: true,
      data: {
        personalizedMenu: menuRecommendations,
        preferences,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating personalized menu:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate personalized menu',
      error: error.message
    });
  }
});

// GET: Get AI analytics for customer dashboard
router.get('/analytics', async (req, res) => {
  try {
    // Sample analytics data for customer AI features
    const analytics = {
      totalRecommendations: 1247,
      accuracyRate: 89.5,
      customerSatisfaction: 4.6,
      costSavingsGenerated: 234500,
      popularEventTypes: [
        { type: 'Wedding', count: 45, percentage: 35 },
        { type: 'Birthday', count: 38, percentage: 30 },
        { type: 'Corporate', count: 25, percentage: 20 },
        { type: 'Anniversary', count: 19, percentage: 15 }
      ],
      seasonalTrends: {
        spring: { events: 28, avgBudget: 85000 },
        summer: { events: 35, avgBudget: 92000 },
        monsoon: { events: 22, avgBudget: 78000 },
        winter: { events: 42, avgBudget: 105000 }
      },
      budgetOptimizationStats: {
        avgSavings: 18.5,
        mostEffectiveOptimization: 'Buffet vs Plated Service',
        totalCustomersSaved: 892
      },
      menuPreferences: {
        vegetarian: 45,
        nonVegetarian: 55,
        topItems: [
          { name: 'Paneer Butter Masala', orders: 156 },
          { name: 'Butter Chicken', orders: 142 },
          { name: 'Biryani', orders: 138 },
          { name: 'Samosa', orders: 134 },
          { name: 'Gulab Jamun', orders: 128 }
        ]
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching AI analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI analytics',
      error: error.message
    });
  }
});

module.exports = router;
