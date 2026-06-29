class AICustomerAssistant {
  constructor() {
    this.menuDatabase = this.initializeMenuDatabase();
    this.eventTypes = this.initializeEventTypes();
    this.seasonalFactors = this.initializeSeasonalFactors();
  }

  // Initialize menu database with Indian catering options
  initializeMenuDatabase() {
    return {
      vegetarian: {
        appetizers: [
          { name: 'Paneer Tikka', price: 250, popularity: 0.9, season: 'all' },
          { name: 'Aloo Tikki', price: 180, popularity: 0.8, season: 'all' },
          { name: 'Samosa', price: 150, popularity: 0.95, season: 'all' },
          { name: 'Dhokla', price: 200, popularity: 0.7, season: 'all' }
        ],
        mains: [
          { name: 'Dal Makhani', price: 300, popularity: 0.9, season: 'all' },
          { name: 'Paneer Butter Masala', price: 350, popularity: 0.95, season: 'all' },
          { name: 'Chole Bhature', price: 280, popularity: 0.8, season: 'winter' },
          { name: 'Rajma Rice', price: 250, popularity: 0.7, season: 'all' },
          { name: 'Veg Biryani', price: 320, popularity: 0.85, season: 'all' }
        ],
        desserts: [
          { name: 'Gulab Jamun', price: 200, popularity: 0.9, season: 'all' },
          { name: 'Rasgulla', price: 180, popularity: 0.8, season: 'summer' },
          { name: 'Kulfi', price: 150, popularity: 0.7, season: 'summer' },
          { name: 'Gajar Halwa', price: 220, popularity: 0.8, season: 'winter' }
        ]
      },
      nonVegetarian: {
        appetizers: [
          { name: 'Chicken Tikka', price: 350, popularity: 0.9, season: 'all' },
          { name: 'Fish Fry', price: 400, popularity: 0.7, season: 'all' },
          { name: 'Mutton Seekh Kebab', price: 450, popularity: 0.8, season: 'all' }
        ],
        mains: [
          { name: 'Butter Chicken', price: 450, popularity: 0.95, season: 'all' },
          { name: 'Chicken Biryani', price: 380, popularity: 0.9, season: 'all' },
          { name: 'Mutton Curry', price: 500, popularity: 0.8, season: 'winter' },
          { name: 'Fish Curry', price: 420, popularity: 0.7, season: 'all' }
        ],
        desserts: [
          { name: 'Sheer Khurma', price: 250, popularity: 0.6, season: 'all' }
        ]
      }
    };
  }

  // Initialize event types with characteristics
  initializeEventTypes() {
    return {
      wedding: {
        avgGuests: 200,
        budgetMultiplier: 1.5,
        preferredItems: ['Paneer Butter Masala', 'Chicken Biryani', 'Gulab Jamun'],
        duration: 'full-day',
        complexity: 'high'
      },
      birthday: {
        avgGuests: 50,
        budgetMultiplier: 1.0,
        preferredItems: ['Samosa', 'Paneer Tikka', 'Cake'],
        duration: 'half-day',
        complexity: 'medium'
      },
      corporate: {
        avgGuests: 100,
        budgetMultiplier: 1.2,
        preferredItems: ['Veg Biryani', 'Dal Makhani', 'Samosa'],
        duration: 'lunch',
        complexity: 'medium'
      },
      anniversary: {
        avgGuests: 30,
        budgetMultiplier: 1.3,
        preferredItems: ['Butter Chicken', 'Paneer Butter Masala', 'Gulab Jamun'],
        duration: 'dinner',
        complexity: 'medium'
      },
      festival: {
        avgGuests: 150,
        budgetMultiplier: 1.4,
        preferredItems: ['Chole Bhature', 'Aloo Tikki', 'Gajar Halwa'],
        duration: 'full-day',
        complexity: 'high'
      }
    };
  }

  // Initialize seasonal factors
  initializeSeasonalFactors() {
    return {
      spring: { factor: 1.0, preferredItems: ['light', 'fresh'] },
      summer: { factor: 0.9, preferredItems: ['cold', 'refreshing'] },
      monsoon: { factor: 1.1, preferredItems: ['hot', 'spicy'] },
      winter: { factor: 1.2, preferredItems: ['rich', 'warm'] }
    };
  }

  // AI-powered menu recommendation
  generateMenuRecommendations(customerProfile, eventDetails) {
    const { eventType, guests, budget, preferences = {} } = eventDetails;
    const currentSeason = this.getCurrentSeason();
    
    const eventInfo = this.eventTypes[eventType.toLowerCase()] || this.eventTypes.birthday;
    const isVegetarian = preferences.vegetarian || false;
    
    const menuCategory = isVegetarian ? 'vegetarian' : 'nonVegetarian';
    const menuItems = this.menuDatabase[menuCategory];
    
    // Calculate budget per person
    const budgetPerPerson = budget / guests;
    
    // AI scoring algorithm
    const recommendations = {
      appetizers: this.scoreAndSelectItems(menuItems.appetizers, {
        budget: budgetPerPerson * 0.3,
        season: currentSeason,
        eventType,
        guests
      }),
      mains: this.scoreAndSelectItems(menuItems.mains, {
        budget: budgetPerPerson * 0.5,
        season: currentSeason,
        eventType,
        guests
      }),
      desserts: this.scoreAndSelectItems(menuItems.desserts, {
        budget: budgetPerPerson * 0.2,
        season: currentSeason,
        eventType,
        guests
      })
    };

    return {
      recommendations,
      totalEstimatedCost: this.calculateTotalCost(recommendations, guests),
      confidenceScore: this.calculateConfidenceScore(recommendations, eventDetails),
      reasoning: this.generateRecommendationReasoning(recommendations, eventDetails, currentSeason)
    };
  }

  // Score and select menu items using AI
  scoreAndSelectItems(items, criteria) {
    const { budget, season, eventType, guests } = criteria;
    
    return items
      .map(item => ({
        ...item,
        aiScore: this.calculateItemScore(item, criteria)
      }))
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, Math.min(3, items.length))
      .map(item => ({
        ...item,
        recommended: item.aiScore > 0.7,
        reasoning: this.generateItemReasoning(item, criteria)
      }));
  }

  // Calculate AI score for individual items
  calculateItemScore(item, criteria) {
    let score = 0;
    
    // Popularity factor (40%)
    score += item.popularity * 0.4;
    
    // Budget compatibility (30%)
    const budgetScore = item.price <= criteria.budget ? 1 : Math.max(0, 1 - (item.price - criteria.budget) / criteria.budget);
    score += budgetScore * 0.3;
    
    // Seasonal appropriateness (20%)
    const seasonScore = item.season === 'all' || item.season === criteria.season ? 1 : 0.5;
    score += seasonScore * 0.2;
    
    // Guest count appropriateness (10%)
    const guestScore = criteria.guests > 100 ? (item.popularity > 0.8 ? 1 : 0.7) : 1;
    score += guestScore * 0.1;
    
    return Math.min(1, score);
  }

  // Generate personalized event planning suggestions
  generateEventPlanningInsights(eventDetails, customerHistory = []) {
    const { eventType, guests, budget, date } = eventDetails;
    const eventInfo = this.eventTypes[eventType.toLowerCase()] || this.eventTypes.birthday;
    
    const insights = {
      budgetAnalysis: this.analyzeBudget(budget, guests, eventType),
      timingRecommendations: this.generateTimingRecommendations(eventType, date),
      guestCapacityInsights: this.analyzeGuestCapacity(guests, eventType),
      seasonalConsiderations: this.getSeasonalConsiderations(date),
      costOptimizations: this.generateCostOptimizations(budget, guests, eventType),
      riskAssessment: this.assessEventRisks(eventDetails)
    };

    return insights;
  }

  // Analyze budget appropriateness
  analyzeBudget(budget, guests, eventType) {
    const eventInfo = this.eventTypes[eventType.toLowerCase()] || this.eventTypes.birthday;
    const recommendedBudgetPerPerson = 500 * eventInfo.budgetMultiplier;
    const totalRecommendedBudget = recommendedBudgetPerPerson * guests;
    
    const budgetRatio = budget / totalRecommendedBudget;
    
    let analysis = {
      status: 'adequate',
      message: 'Your budget looks good for this event.',
      recommendations: []
    };
    
    if (budgetRatio < 0.7) {
      analysis.status = 'low';
      analysis.message = 'Your budget might be tight for this event type.';
      analysis.recommendations = [
        'Consider reducing guest count',
        'Opt for more economical menu items',
        'Choose buffet style over plated service'
      ];
    } else if (budgetRatio > 1.5) {
      analysis.status = 'high';
      analysis.message = 'You have a generous budget! Consider premium options.';
      analysis.recommendations = [
        'Add premium menu items',
        'Include live cooking stations',
        'Consider additional services like decoration'
      ];
    }
    
    analysis.budgetPerPerson = Math.round(budget / guests);
    analysis.recommendedBudgetPerPerson = Math.round(recommendedBudgetPerPerson);
    
    return analysis;
  }

  // Generate timing recommendations
  generateTimingRecommendations(eventType, date) {
    const eventDate = new Date(date);
    const dayOfWeek = eventDate.getDay();
    const month = eventDate.getMonth();
    
    const recommendations = {
      optimalTiming: this.getOptimalTiming(eventType, dayOfWeek),
      seasonalFactors: this.getSeasonalTimingFactors(month),
      dayOfWeekInsights: this.getDayOfWeekInsights(dayOfWeek, eventType),
      bookingAdvice: this.getBookingAdvice(eventType, eventDate)
    };
    
    return recommendations;
  }

  // Generate cost optimization suggestions
  generateCostOptimizations(budget, guests, eventType) {
    const optimizations = [];
    
    const budgetPerPerson = budget / guests;
    
    if (budgetPerPerson < 400) {
      optimizations.push({
        type: 'menu',
        suggestion: 'Choose combo meals instead of à la carte',
        savings: '15-20%'
      });
      
      optimizations.push({
        type: 'service',
        suggestion: 'Opt for buffet service over plated meals',
        savings: '10-15%'
      });
    }
    
    if (guests > 100) {
      optimizations.push({
        type: 'bulk',
        suggestion: 'Bulk pricing available for large events',
        savings: '8-12%'
      });
    }
    
    optimizations.push({
      type: 'timing',
      suggestion: 'Weekday events cost 20% less than weekends',
      savings: '20%'
    });
    
    return optimizations;
  }

  // Generate smart catering suggestions based on customer behavior
  generateSmartSuggestions(customerProfile, currentOrder) {
    const suggestions = [];
    
    // Based on order history
    if (customerProfile.orderHistory && customerProfile.orderHistory.length > 0) {
      const favoriteItems = this.analyzeFavoriteItems(customerProfile.orderHistory);
      suggestions.push({
        type: 'favorites',
        title: 'Based on your previous orders',
        items: favoriteItems,
        confidence: 0.8
      });
    }
    
    // Seasonal suggestions
    const seasonalItems = this.getSeasonalSuggestions();
    suggestions.push({
      type: 'seasonal',
      title: 'Perfect for this season',
      items: seasonalItems,
      confidence: 0.7
    });
    
    // Trending items
    const trendingItems = this.getTrendingItems();
    suggestions.push({
      type: 'trending',
      title: 'Popular this month',
      items: trendingItems,
      confidence: 0.6
    });
    
    return suggestions;
  }

  // Helper methods
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'monsoon';
    return 'winter';
  }

  calculateTotalCost(recommendations, guests) {
    let total = 0;
    Object.values(recommendations).forEach(category => {
      category.forEach(item => {
        total += item.price * guests;
      });
    });
    return total;
  }

  calculateConfidenceScore(recommendations, eventDetails) {
    // Calculate confidence based on various factors
    let confidence = 0.7; // Base confidence
    
    // Increase confidence if event type is well-defined
    if (this.eventTypes[eventDetails.eventType.toLowerCase()]) {
      confidence += 0.1;
    }
    
    // Increase confidence if budget is reasonable
    const budgetPerPerson = eventDetails.budget / eventDetails.guests;
    if (budgetPerPerson >= 300 && budgetPerPerson <= 1000) {
      confidence += 0.1;
    }
    
    return Math.min(0.95, confidence);
  }

  generateRecommendationReasoning(recommendations, eventDetails, season) {
    const reasons = [];
    
    reasons.push(`Selected items perfect for ${eventDetails.eventType} events`);
    reasons.push(`Optimized for ${eventDetails.guests} guests`);
    reasons.push(`Seasonal choices for ${season} weather`);
    reasons.push(`Budget-friendly options within ₹${eventDetails.budget.toLocaleString('en-IN')}`);
    
    return reasons;
  }

  generateItemReasoning(item, criteria) {
    const reasons = [];
    
    if (item.popularity > 0.8) {
      reasons.push('Highly popular choice');
    }
    
    if (item.price <= criteria.budget) {
      reasons.push('Within budget');
    }
    
    if (item.season === criteria.season || item.season === 'all') {
      reasons.push('Perfect for current season');
    }
    
    return reasons.join(', ');
  }

  getOptimalTiming(eventType, dayOfWeek) {
    const timings = {
      wedding: { start: '11:00 AM', end: '10:00 PM' },
      birthday: { start: '6:00 PM', end: '10:00 PM' },
      corporate: { start: '12:00 PM', end: '2:00 PM' },
      anniversary: { start: '7:00 PM', end: '11:00 PM' },
      festival: { start: '10:00 AM', end: '8:00 PM' }
    };
    
    return timings[eventType] || timings.birthday;
  }

  getSeasonalTimingFactors(month) {
    const factors = {
      summer: 'Consider evening events to avoid heat',
      winter: 'Daytime events are more comfortable',
      monsoon: 'Indoor venues recommended',
      spring: 'Perfect weather for any timing'
    };
    
    const season = this.getCurrentSeason();
    return factors[season];
  }

  getDayOfWeekInsights(dayOfWeek, eventType) {
    const insights = {
      0: 'Sunday events are popular but may cost more',
      1: 'Monday events offer best pricing',
      2: 'Tuesday events are budget-friendly',
      3: 'Wednesday events have good availability',
      4: 'Thursday events are moderately priced',
      5: 'Friday events are popular for corporate',
      6: 'Saturday events are premium priced'
    };
    
    return insights[dayOfWeek];
  }

  getBookingAdvice(eventType, eventDate) {
    const daysUntilEvent = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent < 7) {
      return 'Last-minute booking - limited options available';
    } else if (daysUntilEvent < 30) {
      return 'Good timing for booking - most options available';
    } else {
      return 'Early booking - excellent for planning and discounts';
    }
  }

  analyzeFavoriteItems(orderHistory) {
    // Analyze past orders to find favorite items
    const itemCounts = {};
    
    orderHistory.forEach(order => {
      if (order.menu) {
        order.menu.split(',').forEach(item => {
          const trimmedItem = item.trim();
          itemCounts[trimmedItem] = (itemCounts[trimmedItem] || 0) + 1;
        });
      }
    });
    
    return Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([item, count]) => ({ name: item, frequency: count }));
  }

  getSeasonalSuggestions() {
    const season = this.getCurrentSeason();
    const seasonalItems = [];
    
    Object.values(this.menuDatabase).forEach(category => {
      Object.values(category).forEach(items => {
        items.forEach(item => {
          if (item.season === season || item.season === 'all') {
            seasonalItems.push(item);
          }
        });
      });
    });
    
    return seasonalItems
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5);
  }

  getTrendingItems() {
    // Simulate trending items based on popularity
    const allItems = [];
    
    Object.values(this.menuDatabase).forEach(category => {
      Object.values(category).forEach(items => {
        allItems.push(...items);
      });
    });
    
    return allItems
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5);
  }

  assessEventRisks(eventDetails) {
    const risks = [];
    const { eventType, guests, budget, date } = eventDetails;
    
    const eventDate = new Date(date);
    const daysUntilEvent = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent < 7) {
      risks.push({
        type: 'timing',
        level: 'high',
        message: 'Short notice may limit menu options'
      });
    }
    
    const budgetPerPerson = budget / guests;
    if (budgetPerPerson < 300) {
      risks.push({
        type: 'budget',
        level: 'medium',
        message: 'Budget may be tight for desired quality'
      });
    }
    
    if (guests > 200) {
      risks.push({
        type: 'logistics',
        level: 'medium',
        message: 'Large event requires careful coordination'
      });
    }
    
    return risks;
  }
}

module.exports = new AICustomerAssistant();
