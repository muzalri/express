const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/db');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const userRoutes = require('./routes/userRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const documentationRoutes = require('./routes/documentationRoutes');
const { updateStatistics } = require('./controllers/statisticController');

const startServer = async () => {
  try {
    dotenv.config();
    
    // Connect to database
    await connectDB();
    
    const app = express();
    
    // Middlewares
    app.use(cors({
      origin: '*',
      credentials: true
    }));
    
    app.use(bodyParser.json());
    app.use('/uploads', express.static('public/uploads'));
    
    // Logging middleware
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url}`);
      next();
    });
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api', donationRoutes);
    app.use('/api', newsRoutes);
    app.use('/api', campaignRoutes);
    app.use('/api', userRoutes);
    app.use('/api', statisticRoutes);
    app.use('/api', documentationRoutes);
    
    // Root route
    app.get('/', (req, res) => {
      res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date()
      });
    });
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
    
    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });
    setInterval(updateStatistics, 3600000);
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
