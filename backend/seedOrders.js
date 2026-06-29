const mongoose = require('mongoose');
const Order = require('./models/Order');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/catering-system')
.then(() => console.log('✅ MongoDB connected for seeding'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const seedData = [
  {
    orderId: 'ORD001',
    client: 'Rajesh Kumar',
    event: 'Wedding',
    date: new Date('2024-01-15'),
    amount: 75000,
    status: 'Confirmed',
    guests: 150,
    menu: 'Mixed',
    location: 'New Delhi'
  },
  {
    orderId: 'ORD002',
    client: 'Priya Sharma',
    event: 'Birthday',
    date: new Date('2024-01-16'),
    amount: 25000,
    status: 'Pending',
    guests: 50,
    menu: 'Vegetarian',
    location: 'Mumbai'
  },
  {
    orderId: 'ORD003',
    client: 'Amit Singh',
    event: 'Corporate',
    date: new Date('2024-01-17'),
    amount: 50000,
    status: 'Confirmed',
    guests: 100,
    menu: 'Non-Vegetarian',
    location: 'Bangalore'
  },
  {
    orderId: 'ORD004',
    client: 'Sunita Patel',
    event: 'Anniversary',
    date: new Date('2024-01-20'),
    amount: 35000,
    status: 'Pending',
    guests: 75,
    menu: 'Mixed',
    location: 'Pune'
  },
  {
    orderId: 'ORD005',
    client: 'Vikram Gupta',
    event: 'Corporate Meeting',
    date: new Date('2024-01-18'),
    amount: 15000,
    status: 'Completed',
    guests: 30,
    menu: 'Vegetarian',
    location: 'Chennai'
  }
];

async function seedOrders() {
  try {
    // Clear existing orders
    await Order.deleteMany({});
    console.log('🗑️ Cleared existing orders');
    
    // Insert seed data
    const result = await Order.insertMany(seedData);
    console.log(`✅ Successfully seeded ${result.length} orders`);
    
    // Display seeded orders
    console.log('\n📋 Seeded Orders:');
    result.forEach(order => {
      console.log(`- ${order.orderId}: ${order.client} - ${order.event} (₹${order.amount.toLocaleString('en-IN')}) - ${order.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    process.exit(1);
  }
}

seedOrders();
