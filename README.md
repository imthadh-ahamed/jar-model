# Water Treatment Prediction System

A complete fullstack machine learning web application for predicting water treatment parameters using AI. The system consists of three services working together to provide accurate water quality predictions.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Node.js +     │    │   Python        │
│   Frontend      │───▶│   Express       │───▶│   FastAPI       │
│   (Port 3000)   │    │   Backend       │    │   ML Backend    │
│                 │    │   (Port 3002)   │    │   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Flow

1. **Frontend (Next.js)**: Provides a modern, responsive user interface where users can input water quality parameters through a validated form
2. **Backend (Node.js + Express)**: Acts as an API middleware layer that validates incoming requests, handles errors, and forwards requests to the Python ML backend
3. **ML Backend (Python + FastAPI)**: Processes the water quality data using pre-trained machine learning models to generate predictions for pH, turbidity, and colour levels

### Step-by-Step Instructions

#### Step 1: Clone and Setup the Repository

```bash
# Clone the repository
git clone <repository-url>
cd jar-model

# Verify the project structure
ls -la
```

#### Step 2: Setup Python Backend

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Verify models are available
ls -la models/

# If models are missing, copy from root models directory
# cp ../models/*.pkl ./models/

# Start the Python FastAPI backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

The Python backend will be available at: `http://localhost:8000`
Health check: `http://localhost:8000/health`

#### Step 3: Setup Node.js Backend (New Terminal)

```bash
# Navigate to server directory
cd server

# Install Node.js dependencies
npm install

# Check environment variables (optional)
cat .env

# Start the Node.js Express backend
npm run dev
```
#### Step 4: Setup Next.js Frontend (New Terminal)

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Check environment variables (optional)
cat .env.local

# Start the Next.js development server
npm run dev
```

#### Step 5: Verify Application is Running

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Fill out the form** with sample water quality parameters
3. **Submit the form** to test the complete prediction flow
4. **Check all services** are responding:
   - Frontend: `http://localhost:3000`
   - Node.js API: `http://localhost:3002`
   - Python API: `http://localhost:8000`

## 📊 API Documentation

### Water Quality Parameters

The application accepts the following water quality parameters as input for prediction:

| Parameter | Unit | Description | Example Value |
|-----------|------|-------------|---------------|
| alkalinity | mg/L | Total alkalinity of water | 204.89 |
| hardness | mg/L | Total hardness of water | 204.89 |
| ph | - | pH level of water | 3.72 |
| solids | mg/L | Total dissolved solids | 22018.42 |
| chloramines | mg/L | Chloramine concentration | 8.06 |
| conductivity | μS/cm | Electrical conductivity | 349.17 |
| organic_carbon | mg/L | Total organic carbon | 14.95 |
| trihalomethanes | μg/L | Trihalomethane concentration | 71.98 |
| turbidity | NTU | Water turbidity | 2.96 |

### Example API Call

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "alkalinity": 204.89,
    "hardness": 204.89,
    "ph": 3.72,
    "solids": 22018.42,
    "chloramines": 8.06,
    "conductivity": 349.17,
    "organic_carbon": 14.95,
    "trihalomethanes": 71.98,
    "turbidity": 2.96
  }'
```

### Example Response

The API returns predictions for three water treatment parameters:

```json
{
  "success": true,
  "data": {
    "success": true,
    "predictions": {
      "turbidity": 1.73,
      "colour": 10.17,
      "ph": 6.67
    },
    "input": {
      "alkalinity": 204.89,
      "hardness": 204.89,
      "ph": 3.72,
      "solids": 22018.42,
      "chloramines": 8.06,
      "conductivity": 349.17,
      "organic_carbon": 14.95,
      "trihalomethanes": 71.98,
      "turbidity": 2.96
    },
    "timestamp": "2025-07-05T05:44:02.215Z",
    "processing_time_ms": 47
  }
}
```

## 📋 Features

- **🎨 Modern UI**: Clean, responsive design built with Tailwind CSS and Next.js
- **📊 Real-time Predictions**: Instant machine learning predictions for water treatment parameters
- **🔄 Loading States**: Smooth loading indicators and comprehensive error handling
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🛡️ Input Validation**: Comprehensive form validation and data sanitization
- **📈 Result Visualization**: Clear display of prediction results with interpretation guides
- **🔍 Health Monitoring**: Built-in health check endpoints for all services
- **🐳 Containerized**: Complete Docker support for easy deployment and scaling
- **⚡ Fast Processing**: Optimized prediction pipeline with processing time tracking
- **🔒 Error Handling**: Robust error handling with user-friendly error messages