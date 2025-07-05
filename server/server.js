const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const predictionRoutes = require('./routes/prediction');
const healthRoutes = require('./routes/health');
const { errorHandler, notFoundHandler } = require('./utils/errorHandlers');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Request timeout middleware
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({
      error: 'Request timeout',
      message: 'The request took too long to process'
    });
  });
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api', predictionRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Water Treatment Prediction API - Node.js Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      predict: '/api/predict',
      models: '/api/models'
    },
    documentation: '/api/docs'
  });
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Water Treatment Prediction API',
    version: '1.0.0',
    description: 'Node.js Express middleware for water treatment ML predictions',
    endpoints: {
      'GET /api/health': 'Check service health status',
      'POST /api/predict': 'Make water treatment predictions',
      'GET /api/models': 'List available prediction models'
    },
    exampleRequest: {
      method: 'POST',
      url: '/api/predict',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        alkalinity: 204.89,
        hardness: 204.89,
        ph: 3.72,
        solids: 20791.32,
        chloramines: 7.30,
        conductivity: 421.50,
        organic_carbon: 14.28,
        trihalomethanes: 66.42,
        turbidity: 4.50
      }
    },
    exampleResponse: {
      success: true,
      predictions: {
        turbidity: 2.500,
        colour: 8.200,
        ph: 7.100
      },
      input: {
        alkalinity: 204.89,
        hardness: 204.89,
        ph: 3.72,
        solids: 20791.32,
        chloramines: 7.30,
        conductivity: 421.50,
        organic_carbon: 14.28,
        trihalomethanes: 66.42,
        turbidity: 4.50
      },
      timestamp: new Date().toISOString(),
      processing_time_ms: 156
    }
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`🚀 Node.js Express server running on port ${PORT}`);
  console.log(`🔗 Python service URL: ${process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📖 API documentation: http://localhost:${PORT}/api/docs`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
