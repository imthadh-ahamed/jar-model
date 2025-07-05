# Node.js Express Backend

This is the Node.js Express middleware service for the Water Treatment Prediction application.

## Features

- **Express.js** web framework with modern middleware
- **Request validation** using Joi
- **Rate limiting** and security headers
- **Error handling** and logging
- **Health checks** and monitoring
- **Python service integration**
- **CORS support** for frontend communication

## Setup

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
Copy `.env.example` to `.env` and update the values:
```bash
NODE_ENV=development
PORT=3001
PYTHON_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

3. **Run the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3001`

### Docker

```bash
# Build the image
docker build -t water-treatment-node-api .

# Run the container
docker run -p 3001:3001 -e PYTHON_SERVICE_URL=http://host.docker.internal:8000 water-treatment-node-api
```

## API Endpoints

### `GET /api/health`
Health check endpoint that returns status of both Node.js and Python services.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-05T12:00:00Z",
  "services": {
    "node_backend": {
      "status": "running",
      "port": 3001,
      "version": "1.0.0"
    },
    "python_service": {
      "status": "healthy",
      "models_loaded": ["turbidity", "colour", "ph"]
    }
  },
  "uptime": 3600,
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 18874368
  }
}
```

### `POST /api/predict`
Main prediction endpoint with full validation and error handling.

**Request:**
```json
{
  "Raw_Turbidity": 25.0,
  "Raw_PH": 7.2,
  "Raw_Colour": 45.0,
  "PAC": 8.5,
  "KMnO4": 2.1,
  "ACD": 1.5
}
```

**Response:**
```json
{
  "success": true,
  "predictions": {
    "turbidity": 2.500,
    "colour": 8.200,
    "ph": 7.100
  },
  "input": {
    "Raw_Turbidity": 25.0,
    "Raw_PH": 7.2,
    "Raw_Colour": 45.0,
    "PAC": 8.5,
    "KMnO4": 2.1,
    "ACD": 1.5
  },
  "model_info": {
    "turbidity": {
      "models_used": ["xgb", "ada", "rf"],
      "feature_count": 15
    }
  },
  "timestamp": "2025-07-05T12:00:00Z",
  "processing_time_ms": 156
}
```

### `GET /api/models`
Returns information about available models from the Python service.

### `GET /api/docs`
API documentation endpoint.

## Validation

Input validation is performed using Joi with detailed error messages:

- **Raw_Turbidity**: Number ≥ 0
- **Raw_PH**: Number between 0 and 14
- **Raw_Colour**: Number ≥ 0
- **PAC**: Number ≥ 0
- **KMnO4**: Number ≥ 0
- **ACD**: Number ≥ 0

## Error Handling

Comprehensive error handling for various scenarios:

- **400 Bad Request**: Validation errors
- **404 Not Found**: Unknown endpoints
- **408 Request Timeout**: Slow requests
- **503 Service Unavailable**: Python service down
- **500 Internal Server Error**: Unexpected errors

## Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** (100 requests per 15 minutes)
- **Request size limits**
- **Input sanitization**

## Architecture

```
Frontend (Next.js) 
    ↓ HTTP/JSON
Node.js Express Backend
    ↓ HTTP/JSON
Python FastAPI Service
```

The Node.js service acts as a middleware layer that:
- Validates incoming requests
- Handles authentication (if needed)
- Forwards requests to Python service
- Processes responses
- Provides enhanced error handling
- Adds monitoring and logging

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Variables

- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 3001)
- `PYTHON_SERVICE_URL`: Python FastAPI service URL
- `FRONTEND_URL`: Frontend application URL for CORS

## Performance

- **Compression** middleware for response compression
- **Request timeouts** to prevent hanging requests
- **Connection pooling** for HTTP requests
- **Memory usage monitoring**
