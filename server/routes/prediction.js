const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { validatePredictionInput } = require('../utils/validation');

// POST /api/predict - Main prediction endpoint
router.post('/predict', validatePredictionInput, predictionController.predict);

// GET /api/models - List available models
router.get('/models', predictionController.getModels);

module.exports = router;
