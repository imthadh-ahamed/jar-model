const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// GET /api/health - Health check endpoint
router.get('/', healthController.healthCheck);

module.exports = router;
