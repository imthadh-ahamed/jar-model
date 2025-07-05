const pythonService = require('../services/pythonService');

const predict = async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('Received prediction request:', req.body);
    
    // Forward request to Python service
    const pythonResponse = await pythonService.makePrediction(req.body);
    
    const processingTime = Date.now() - startTime;
    
    console.log('Python service response:', pythonResponse);
    
    // Return enhanced response
    res.json({
      success: true,
      predictions: pythonResponse.predictions,
      input: req.body,
      model_info: pythonResponse.model_info,
      timestamp: new Date().toISOString(),
      processing_time_ms: processingTime
    });
    
  } catch (error) {
    console.error('Prediction error:', error);
    
    const processingTime = Date.now() - startTime;
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Python prediction service is not available',
        details: 'Please ensure the Python backend service is running',
        processing_time_ms: processingTime
      });
    }
    
    if (error.response) {
      // Python service returned an error
      return res.status(error.response.status).json({
        success: false,
        error: 'Prediction failed',
        message: error.response.data.detail || 'Unknown error from prediction service',
        details: error.response.data,
        processing_time_ms: processingTime
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout',
        message: 'The prediction request took too long to process',
        processing_time_ms: processingTime
      });
    }
    
    // Generic error
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request',
      details: error.message,
      processing_time_ms: processingTime
    });
  }
};

const getModels = async (req, res) => {
  try {
    const modelsInfo = await pythonService.getModels();
    
    res.json({
      success: true,
      models: modelsInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get models error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Python service is not available'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve models',
      message: error.message
    });
  }
};

module.exports = {
  predict,
  getModels
};
