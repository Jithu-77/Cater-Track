const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/catering-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected for seeding'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const seedData = [
  {
    name: 'Basmati Rice',
    quantity: 500,
    unit: 'kg',
    category: 'Grains',
    supplier: 'ABC Suppliers',
    cost: 80
  },
  {
    name: 'Chicken',
    quantity: 50,
    unit: 'kg',
    category: 'Meat',
    supplier: 'Fresh Meat Co',
    cost: 250
  },
  {
    name: 'Vegetables Mix',
    quantity: 200,
    unit: 'kg',
    category: 'Vegetables',
    supplier: 'Green Farm',
    cost: 40
  },
  {
    name: 'Cooking Oil',
    quantity: 100,
    unit: 'L',
    category: 'Oil',
    supplier: 'Oil Industries',
    cost: 120
  },
  {
    name: 'Spices Mix',
    quantity: 75,
    unit: 'kg',
    category: 'Spices',
    supplier: 'Spice World',
    cost: 200
  },
  {
    name: 'Onions',
    quantity: 150,
    unit: 'kg',
    category: 'Vegetables',
    supplier: 'Green Farm',
    cost: 30
  },
  {
    name: 'Tomatoes',
    quantity: 100,
    unit: 'kg',
    category: 'Vegetables',
    supplier: 'Green Farm',
    cost: 50
  },
  {
    name: 'Milk',
    quantity: 200,
    unit: 'L',
    category: 'Dairy',
    supplier: 'Dairy Fresh',
    cost: 60
  }
];

async function seedInventory() {
  try {
    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('🗑️ Cleared existing inventory');
    
    // Insert seed data
    const result = await Inventory.insertMany(seedData);
    console.log(`✅ Successfully seeded ${result.length} inventory items`);
    
    // Display seeded items
    console.log('\n📦 Seeded Inventory Items:');
    result.forEach(item => {
      console.log(`- ${item.name}: ${item.quantity} ${item.unit} (${item.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    process.exit(1);
  }
}

seedInventory();
