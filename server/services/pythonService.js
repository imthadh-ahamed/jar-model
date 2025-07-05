const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Create axios instance with default config
const pythonClient = axios.create({
  baseURL: PYTHON_SERVICE_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for logging
pythonClient.interceptors.response.use(
  (response) => {
    console.log(`Python service response: ${response.status} - ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`Python service error: ${error.message} - ${error.config?.url}`);
    return Promise.reject(error);
  }
);

const makePrediction = async (inputData) => {
  try {
    const response = await pythonClient.post('/predict', inputData);
    return response.data;
  } catch (error) {
    console.error('Python prediction service error:', error.message);
    throw error;
  }
};

const getModels = async () => {
  try {
    const response = await pythonClient.get('/models');
    return response.data;
  } catch (error) {
    console.error('Python models service error:', error.message);
    throw error;
  }
};

const getHealth = async () => {
  try {
    const response = await pythonClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Python health service error:', error.message);
    throw error;
  }
};

module.exports = {
  makePrediction,
  getModels,
  getHealth
};
