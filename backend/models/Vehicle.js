const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['van', 'truck', 'car', 'refrigerated', 'motorcycle'],
    required: true,
  },
  capacity: {
    weight: Number, // kg
    volume: Number, // cubic meters
    passengers: Number,
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance', 'damaged', 'in-transit'],
    default: 'available',
  },
  location: {
    current: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    base: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
  },
  specifications: {
    year: Number,
    make: String,
    model: String,
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    },
    mileage: Number,
    features: [String],
  },
  maintenanceSchedule: {
    lastMaintenance: Date,
    nextMaintenance: Date,
    maintenanceInterval: { type: Number, default: 10000 }, // kilometers
    currentMileage: { type: Number, default: 0 },
  },
  bookingHistory: [{
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startDate: Date,
    endDate: Date,
    purpose: String,
    route: {
      start: String,
      end: String,
      distance: Number, // km
      estimatedTime: Number, // minutes
    },
    status: {
      type: String,
      enum: ['confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    actualDistance: Number,
    fuelConsumed: Number,
  }],
  utilizationRate: {
    type: Number,
    default: 0, // AI calculated utilization percentage
  },
  fuelEfficiency: {
    type: Number,
    default: 0, // AI calculated km/liter
  },
  aiInsights: {
    recommendedMaintenance: Date,
    fuelEfficiencyTrend: String,
    optimalRoutes: [String],
    costPerKm: Number,
    replacementSuggestion: Boolean,
    predictedBreakdown: {
      probability: Number,
      timeframe: String,
    },
  },
}, { timestamps: true });

// AI/ML Methods
VehicleSchema.methods.calculateUtilization = function() {
  const totalDays = 30; // Calculate for last 30 days
  const bookedDays = this.bookingHistory
    .filter(booking => {
      const bookingDate = new Date(booking.startDate);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return bookingDate >= thirtyDaysAgo && booking.status === 'completed';
    })
    .reduce((total, booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return total + days;
    }, 0);

  this.utilizationRate = Math.min((bookedDays / totalDays) * 100, 100);
  return this.utilizationRate;
};

VehicleSchema.methods.calculateFuelEfficiency = function() {
  const recentTrips = this.bookingHistory
    .filter(booking => {
      const bookingDate = new Date(booking.startDate);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return bookingDate >= thirtyDaysAgo &&
             booking.status === 'completed' &&
             booking.actualDistance &&
             booking.fuelConsumed;
    });

  if (recentTrips.length === 0) return this.fuelEfficiency;

  const totalDistance = recentTrips.reduce((sum, trip) => sum + trip.actualDistance, 0);
  const totalFuel = recentTrips.reduce((sum, trip) => sum + trip.fuelConsumed, 0);

  this.fuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;
  return this.fuelEfficiency;
};

VehicleSchema.methods.predictMaintenanceNeeds = function() {
  const mileageSinceLastMaintenance = this.maintenanceSchedule.currentMileage -
    (this.maintenanceSchedule.lastMaintenance ?
     this.maintenanceSchedule.currentMileage - this.maintenanceSchedule.maintenanceInterval : 0);

  const utilizationFactor = this.utilizationRate / 100;
  const mileageFactor = mileageSinceLastMaintenance / this.maintenanceSchedule.maintenanceInterval;

  // AI logic for maintenance prediction
  const maintenanceScore = (utilizationFactor * 0.4) + (mileageFactor * 0.6);

  if (maintenanceScore > 0.9) {
    this.aiInsights.recommendedMaintenance = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    this.aiInsights.predictedBreakdown = {
      probability: 0.8,
      timeframe: 'within 1 week'
    };
  } else if (maintenanceScore > 0.7) {
    this.aiInsights.recommendedMaintenance = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    this.aiInsights.predictedBreakdown = {
      probability: 0.4,
      timeframe: 'within 2 weeks'
    };
  } else if (maintenanceScore > 0.5) {
    this.aiInsights.recommendedMaintenance = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
    this.aiInsights.predictedBreakdown = {
      probability: 0.1,
      timeframe: 'within 1 month'
    };
  }

  return this.aiInsights.recommendedMaintenance;
};

module.exports = mongoose.model('Vehicle', VehicleSchema);
