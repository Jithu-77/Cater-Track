# 🍽️ AI-Powered Catering & Inventory Management System

A comprehensive, intelligent catering management system with advanced AI features, built with React.js frontend and Node.js backend.

## 🌟 Key Features

### 🤖 **AI-Powered Intelligence**
- **AI Task Optimizer**: Intelligent task scheduling and priority management for staff
- **AI Personal Catering Assistant**: Personalized menu recommendations for customers
- **AI Inventory Monitor**: Automated stock level monitoring with predictive alerts
- **Smart Notifications**: AI-generated alerts and recommendations

### 👥 **Role-Based Dashboards**
- **Admin Dashboard**: Complete system oversight with analytics and reporting
- **Staff Dashboard**: Task management with AI optimization
- **Customer Dashboard**: Order placement with AI recommendations

### 💰 **Financial Management**
- Payment processing with Indian Rupee (₹) support
- Real-time financial reporting and analytics
- Order tracking and payment status management

### 📊 **Inventory Management**
- Real-time stock monitoring
- Automated low-stock alerts
- Predictive demand forecasting
- Expiry date tracking and wastage prevention

## 🚀 Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **CSS3** - Custom styling with responsive design
- **Axios** - HTTP client for API communication
- **Context API** - State management

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **AI Services** - Custom AI algorithms for optimization

## 📁 Project Structure

```
catering-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AIInventoryDashboard.js
│   │   ├── context/
│   │   │   └── DataContext.js
│   │   ├── pages/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── StaffDashboard.js
│   │   │   └── CustomerDashboard.js
│   │   └── App.js
│   └── package.json
├── backend/
│   ├── models/
│   │   ├── Inventory.js
│   │   ├── Order.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── inventory.js
│   │   ├── orders.js
│   │   ├── aiTasks.js
│   │   └── aiCustomer.js
│   ├── services/
│   │   ├── aiTaskOptimizer.js
│   │   ├── aiCustomerAssistant.js
│   │   └── aiInventoryMonitor.js
│   └── server.js
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/KARTHIKRAIG/CATERING-AND-INVENTORY-MANAGEMENT.git
cd CATERING-AND-INVENTORY-MANAGEMENT
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGO_URI=mongodb://localhost:27017/catering-system
PORT=5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start the Application
```bash
# Start backend (from backend directory)
npm start

# Start frontend (from frontend directory)
npm start
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000

## 🤖 AI Features

### AI Task Optimizer
- Analyzes workload patterns and task completion history
- Provides intelligent task scheduling recommendations
- Calculates optimal priority scores based on multiple factors
- Generates actionable insights for staff productivity

### AI Personal Catering Assistant
- Personalized menu recommendations based on event type and preferences
- Budget optimization suggestions
- Seasonal menu adjustments
- Smart event planning insights

### AI Inventory Monitor
- Continuous monitoring of stock levels (every 30 minutes)
- Predictive demand forecasting
- Automated alerts for low stock, expiry warnings, and overstock situations
- Intelligent reorder point calculations

## 📊 Dashboard Features

### Admin Dashboard
- System overview with key metrics
- User management and role assignments
- Financial reporting and analytics
- AI inventory management interface

### Staff Dashboard
- Personal task management with AI optimization
- Real-time inventory status
- Order preparation tracking
- AI-powered productivity insights

### Customer Dashboard
- Intuitive order placement interface
- AI-powered menu recommendations
- Order history and tracking
- Profile management with editing capabilities

## 🔔 Notification System

- Real-time alerts for inventory issues
- AI-generated recommendations
- Priority-based notification classification
- Batch notifications for efficiency

## 💡 AI Algorithms

### Task Optimization Algorithm
- Priority weight (40% of score)
- Time sensitivity (30% of score)
- Task type efficiency (20% of score)
- Status consideration (10% of score)

### Menu Recommendation Engine
- Event type compatibility
- Budget optimization
- Seasonal appropriateness
- Popularity-based scoring

### Inventory Prediction Model
- Demand pattern analysis
- Seasonal adjustment factors
- Wastage risk assessment
- Optimal stock level calculations

## 🎯 Key Benefits

- **Increased Efficiency**: AI-powered task optimization improves staff productivity
- **Cost Reduction**: Intelligent inventory management reduces waste and stockouts
- **Better Customer Experience**: Personalized recommendations enhance satisfaction
- **Data-Driven Decisions**: Real-time analytics support informed decision-making
- **Automated Operations**: Reduces manual monitoring and intervention

## 🔧 Configuration

### Environment Variables
```env
# Backend Configuration
MONGO_URI=your_mongodb_connection_string
PORT=5000

# AI Configuration
AI_TASK_CHECK_INTERVAL=30  # minutes
AI_INVENTORY_CHECK_INTERVAL=30  # minutes
```

## 📈 Performance Features

- Real-time data synchronization
- Optimized database queries
- Efficient state management
- Responsive design for all devices
- Background AI processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**KARTHIK RAIG**
- GitHub: [@KARTHIKRAIG](https://github.com/KARTHIKRAIG)

## 🙏 Acknowledgments

- Built with modern web technologies
- AI algorithms designed for catering industry optimization
- Responsive design for multi-device compatibility

---

⭐ **Star this repository if you find it helpful!**
