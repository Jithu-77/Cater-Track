const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
require('dotenv').config();

const sampleInventoryData = [
  {
    name: 'Basmati Rice',
    category: 'Grains',
    quantity: 5, // Low stock - will trigger alert
    unit: 'kg',
    minThreshold: 10,
    maxThreshold: 50,
    cost: {
      unitCost: 120,
      totalCost: 600,
      supplier: 'Delhi Rice Mills'
    },
    location: {
      warehouse: 'Main Storage',
      section: 'A',
      shelf: '1'
    },
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    batchNumber: 'BR2024001',
    usageHistory: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        quantityUsed: 3,
        purpose: 'Wedding Event'
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        quantityUsed: 2,
        purpose: 'Corporate Lunch'
      }
    ],
    demandPattern: {
      daily: [2, 3, 1, 4, 2, 3, 2],
      seasonal: 'high'
    }
  },
  {
    name: 'Paneer',
    category: 'Dairy',
    quantity: 2, // Very low stock - will trigger critical alert
    unit: 'kg',
    minThreshold: 8,
    maxThreshold: 25,
    cost: {
      unitCost: 350,
      totalCost: 700,
      supplier: 'Fresh Dairy Co.'
    },
    location: {
      warehouse: 'Cold Storage',
      section: 'B',
      shelf: '2'
    },
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now - will trigger expiry alert
    batchNumber: 'PN2024002',
    usageHistory: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        quantityUsed: 4,
        purpose: 'Birthday Party'
      }
    ],
    demandPattern: {
      daily: [3, 4, 2, 5, 3, 4, 3],
      seasonal: 'medium'
    }
  },
  {
    name: 'Tomatoes',
    category: 'Vegetables',
    quantity: 0, // Out of stock - will trigger critical alert
    unit: 'kg',
    minThreshold: 15,
    maxThreshold: 40,
    cost: {
      unitCost: 60,
      totalCost: 0,
      supplier: 'Local Vegetable Market'
    },
    location: {
      warehouse: 'Fresh Storage',
      section: 'C',
      shelf: '1'
    },
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    batchNumber: 'TM2024003',
    usageHistory: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        quantityUsed: 8,
        purpose: 'Corporate Event'
      }
    ],
    demandPattern: {
      daily: [5, 6, 4, 8, 5, 7, 6],
      seasonal: 'high'
    }
  },
  {
    name: 'Cooking Oil',
    category: 'Oils',
    quantity: 25,
    unit: 'L',
    minThreshold: 20,
    maxThreshold: 100,
    cost: {
      unitCost: 150,
      totalCost: 3750,
      supplier: 'Premium Oils Ltd'
    },
    location: {
      warehouse: 'Main Storage',
      section: 'A',
      shelf: '3'
    },
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    batchNumber: 'CO2024004',
    usageHistory: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        quantityUsed: 2,
        purpose: 'Daily Cooking'
      }
    ],
    demandPattern: {
      daily: [2, 3, 2, 3, 2, 2, 3],
      seasonal: 'medium'
    }
  },
  {
    name: 'Onions',
    category: 'Vegetables',
    quantity: 8, // Low stock
    unit: 'kg',
    minThreshold: 12,
    maxThreshold: 35,
    cost: {
      unitCost: 40,
      totalCost: 320,
      supplier: 'Local Vegetable Market'
    },
    location: {
      warehouse: 'Fresh Storage',
      section: 'C',
      shelf: '2'
    },
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    batchNumber: 'ON2024005',
    usageHistory: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        quantityUsed: 3,
        purpose: 'Wedding Prep'
      }
    ],
    demandPattern: {
      daily: [4, 5, 3, 6, 4, 5, 4],
      seasonal: 'high'
    }
  },
  {
    name: 'Chicken',
    category: 'Meat',
    quantity: 3, // Low stock
    unit: 'kg',
    minThreshold: 10,
    maxThreshold: 30,
    cost: {
      unitCost: 280,
      totalCost: 840,
      supplier: 'Fresh Meat Suppliers'
    },
    location: {
      warehouse: 'Cold Storage',
      section: 'B',
      shelf: '1'
    },
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now - will trigger expiry alert
    batchNumber: 'CH2024006',
    usageHistory: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        quantityUsed: 5,
        purpose: 'Corporate Lunch'
      }
    ],
    demandPattern: {
      daily: [4, 6, 3, 7, 5, 6, 4],
      seasonal: 'high'
    }
  }
];

async function seedInventory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');

    // Insert sample data
    const insertedItems = await Inventory.insertMany(sampleInventoryData);
    console.log(`Inserted ${insertedItems.length} inventory items`);

    // Update AI insights for each item
    for (const item of insertedItems) {
      item.calculateDemandPattern();
      item.predictFutureDemand();
      item.optimizeStockLevels();
      await item.save();
    }
    console.log('Updated AI insights for all items');

    console.log('✅ Inventory seeding completed successfully!');
    console.log('🚨 Several items have low stock and will trigger AI alerts');
    
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedInventory();
}

module.exports = { seedInventory, sampleInventoryData };
