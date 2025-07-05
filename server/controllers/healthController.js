const pythonService = require('../services/pythonService');

const healthCheck = async (req, res) => {
  try {
    // Check Python service health
    const pythonHealth = await pythonService.getHealth();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        node_backend: {
          status: 'running',
          port: process.env.PORT || 3001,
          version: '1.0.0'
        },
        python_service: pythonHealth
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        node_backend: {
          status: 'running',
          port: process.env.PORT || 3001,
          version: '1.0.0'
        },
        python_service: {
          status: 'unavailable',
          error: error.message
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  }
};

module.exports = {
  healthCheck
};
