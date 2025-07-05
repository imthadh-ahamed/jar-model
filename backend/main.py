from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
import joblib
import pandas as pd
import numpy as np
import os
import logging
from typing import Dict, Any
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Water Treatment Prediction API",
    description="ML API for predicting water treatment outcomes",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store loaded models
models = {}

class PredictionInput(BaseModel):
    alkalinity: float
    hardness: float
    ph: float
    solids: float
    chloramines: float
    conductivity: float
    organic_carbon: float
    trihalomethanes: float
    turbidity: float
    
    @validator('alkalinity', 'hardness', 'solids', 'chloramines', 'conductivity', 'organic_carbon', 'trihalomethanes', 'turbidity')
    def validate_positive(cls, v):
        if v < 0:
            raise ValueError('Value must be non-negative')
        return v
    
    @validator('ph')
    def validate_ph(cls, v):
        if not 0 <= v <= 14:
            raise ValueError('pH must be between 0 and 14')
        return v

class PredictionResponse(BaseModel):
    success: bool
    predictions: Dict[str, float]
    input_data: Dict[str, float]
    model_info: Dict[str, Any]
    timestamp: str

def create_water_treatment_features(df):
    """Create features based on water treatment domain knowledge"""
    df_enhanced = df.copy()
    
    # Water treatment efficiency ratios - for prediction, we estimate these
    df_enhanced['Turbidity_Removal_Efficiency'] = 0.8  # Default efficiency
    df_enhanced['Colour_Removal_Efficiency'] = 0.7  # Default efficiency
    df_enhanced['PH_Change'] = abs(df_enhanced['Raw_PH'] - 7)  # Change from neutral
    
    # Chemical effectiveness ratios
    df_enhanced['PAC_Effectiveness_Turb'] = df_enhanced['Turbidity_Removal_Efficiency'] / (df_enhanced['PAC'] + 1e-8)
    df_enhanced['KMnO4_Effectiveness_Colour'] = df_enhanced['Colour_Removal_Efficiency'] / (df_enhanced['KMnO4'] + 1e-8)
    
    # Coagulation index (combination that affects settling)
    df_enhanced['Coagulation_Index'] = df_enhanced['PAC'] * np.log1p(df_enhanced['Raw_Turbidity']) / (df_enhanced['Raw_PH'] + 1e-8)
    
    # Oxidation potential (KMnO4 effect on organic matter)
    df_enhanced['Oxidation_Potential'] = df_enhanced['KMnO4'] * df_enhanced['Raw_Colour'] / (df_enhanced['Raw_PH'] + 1e-8)
    
    # Chemical balance indicators
    df_enhanced['Chemical_Balance'] = df_enhanced['PAC'] / (df_enhanced['KMnO4'] + df_enhanced['ACD'] + 1e-8)
    df_enhanced['PH_Buffer_Capacity'] = df_enhanced['ACD'] / (abs(df_enhanced['Raw_PH'] - 7) + 1e-8)
    
    # Raw water quality indicators
    df_enhanced['Raw_Quality_Index'] = df_enhanced['Raw_Turbidity'] * df_enhanced['Raw_Colour'] / (df_enhanced['Raw_PH'] + 1e-8)
    df_enhanced['Contamination_Level'] = np.sqrt(df_enhanced['Raw_Turbidity']**2 + df_enhanced['Raw_Colour']**2)
    
    return df_enhanced

def create_chemical_interaction_features(df):
    """Model chemical interactions and non-linear transformations"""
    df_chem = df.copy()
    
    # Dose-response curves (common in chemical treatment)
    for chemical in ['PAC', 'KMnO4', 'ACD']:
        # Logarithmic dose-response
        df_chem[f'{chemical}_log_dose'] = np.log1p(df_chem[chemical])
        
        # Exponential saturation effect
        df_chem[f'{chemical}_exp_sat'] = 1 - np.exp(-df_chem[chemical]/10)
        
        # Threshold effects (common in water treatment) - use fixed thresholds for prediction
        threshold_values = {'PAC': 5.0, 'KMnO4': 1.5, 'ACD': 2.0}
        df_chem[f'{chemical}_above_threshold'] = (df_chem[chemical] > threshold_values[chemical]).astype(int)
        
        # Power transformations
        df_chem[f'{chemical}_pow2'] = df_chem[chemical] ** 2
        df_chem[f'{chemical}_pow05'] = df_chem[chemical] ** 0.5
    
    # Synergistic effects (chemicals working together)
    df_chem['PAC_KMnO4_synergy'] = df_chem['PAC'] * df_chem['KMnO4'] / (df_chem['PAC'] + df_chem['KMnO4'] + 1e-8)
    df_chem['PAC_ACD_synergy'] = df_chem['PAC'] * df_chem['ACD'] / (df_chem['PAC'] + df_chem['ACD'] + 1e-8)
    df_chem['KMnO4_ACD_synergy'] = df_chem['KMnO4'] * df_chem['ACD'] / (df_chem['KMnO4'] + df_chem['ACD'] + 1e-8)
    
    # Competitive effects (chemicals competing for reaction sites)
    df_chem['Chemical_Competition'] = df_chem['PAC'] / (df_chem['KMnO4'] + df_chem['ACD'] + 1e-8)
    df_chem['Oxidant_Competition'] = df_chem['KMnO4'] / (df_chem['PAC'] + df_chem['ACD'] + 1e-8)
    
    # pH-dependent chemical effectiveness
    ph_factor = 1 / (1 + np.exp(-(df_chem['Raw_PH'] - 7)))  # Sigmoid around neutral pH
    for chemical in ['PAC', 'KMnO4', 'ACD']:
        df_chem[f'{chemical}_pH_adjusted'] = df_chem[chemical] * ph_factor
    
    # Raw water characteristics
    df_chem['Raw_Water_Complexity'] = df_chem['Raw_Turbidity'] * df_chem['Raw_Colour'] * abs(df_chem['Raw_PH'] - 7)
    
    return df_chem

def load_models():
    """Load all pre-trained models"""
    global models
    
    model_files = [
        'water_treatment_turbidity_model.pkl',
        'water_treatment_colour_model.pkl',
        'water_treatment_ph_model.pkl'
    ]
    
    models_dir = '/app/models'  # Docker path
    if not os.path.exists(models_dir):
        models_dir = '../models'  # Local development path
    
    for model_file in model_files:
        try:
            model_path = os.path.join(models_dir, model_file)
            if os.path.exists(model_path):
                target_name = model_file.replace('water_treatment_', '').replace('_model.pkl', '')
                models[target_name] = joblib.load(model_path)
                logger.info(f"Loaded {target_name} model successfully")
            else:
                logger.warning(f"Model file not found: {model_path}")
        except Exception as e:
            logger.error(f"Error loading {model_file}: {str(e)}")

def make_prediction(model_package, input_data):
    """Make prediction using a model package"""
    try:
        # Apply feature engineering
        df_enhanced = create_water_treatment_features(input_data)
        df_final = create_chemical_interaction_features(df_enhanced)
        
        # Select required features
        features = model_package['features']
        available_features = [f for f in features if f in df_final.columns]
        
        if len(available_features) < len(features):
            logger.warning(f"Some features missing. Using {len(available_features)} of {len(features)} features")
        
        X = df_final[available_features]
        
        # Get models, scaler, and weights
        models_dict = model_package['models']
        scaler = model_package['scaler']
        weights = model_package['weights']
        
        # Make predictions with ensemble
        ensemble_pred = 0
        total_weight = 0
        
        for model_name, model in models_dict.items():
            try:
                # Use scaled data for algorithms that need it
                if model_name in ['svr', 'elastic', 'ridge', 'knn']:
                    X_scaled = scaler.transform(X)
                    pred = model.predict(X_scaled)
                else:
                    pred = model.predict(X)
                
                weight = weights.get(model_name, 0)
                ensemble_pred += weight * pred
                total_weight += weight
                
            except Exception as e:
                logger.warning(f"Error with model {model_name}: {str(e)}")
                continue
        
        if total_weight > 0:
            ensemble_pred = ensemble_pred / total_weight
        
        return float(ensemble_pred[0])
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("Starting FastAPI application...")
    load_models()
    logger.info(f"Models loaded: {list(models.keys())}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": list(models.keys()),
        "timestamp": pd.Timestamp.now().isoformat(),
        "service": "python-fastapi"
    }

@app.post("/predict")
async def predict(input_data: PredictionInput):
    """Main prediction endpoint"""
    try:
        logger.info(f"Received prediction request: {input_data.dict()}")
        
        # Convert input to feature array
        features = [
            input_data.alkalinity,
            input_data.hardness,
            input_data.ph,
            input_data.solids,
            input_data.chloramines,
            input_data.conductivity,
            input_data.organic_carbon,
            input_data.trihalomethanes,
            input_data.turbidity
        ]
        
        input_array = np.array([features])
        
        # Make predictions for all available models
        predictions = {}
        confidence = {}
        
        for target_name, model in models.items():
            try:
                prediction = model.predict(input_array)[0]
                predictions[target_name] = round(float(prediction), 2)
                
                # Calculate confidence as normalized prediction variance
                if hasattr(model, 'estimators_'):
                    # For ensemble models, get prediction variance
                    tree_predictions = [estimator.predict(input_array)[0] for estimator in model.estimators_]
                    variance = np.var(tree_predictions)
                    # Convert variance to confidence (higher variance = lower confidence)
                    confidence[target_name] = round(float(max(0.5, 1.0 - min(variance / 10, 0.5))), 2)
                else:
                    confidence[target_name] = 0.85  # Default confidence
                
                logger.info(f"Predicted {target_name}: {prediction}")
            except Exception as e:
                logger.error(f"Error predicting {target_name}: {str(e)}")
                continue
        
        # Check if any predictions were successful
        if not predictions:
            raise HTTPException(status_code=500, detail="All predictions failed")
        
        # Calculate feature importance (using first available model)
        feature_importance = {}
        if models:
            first_model = next(iter(models.values()))
            if hasattr(first_model, 'feature_importances_'):
                feature_names = ['alkalinity', 'hardness', 'ph', 'solids', 'chloramines', 
                               'conductivity', 'organic_carbon', 'trihalomethanes', 'turbidity']
                importances = first_model.feature_importances_
                feature_importance = {name: round(float(imp), 3) for name, imp in zip(feature_names, importances)}
        
        response = {
            "predictions": predictions,
            "confidence": confidence,
            "feature_importance": feature_importance,
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
        logger.info(f"Returning predictions: {predictions}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def list_models():
    """List available models"""
    model_info = {}
    for target_name, model_package in models.items():
        model_info[target_name] = {
            'features': model_package['features'],
            'models': list(model_package['models'].keys()),
            'weights': model_package['weights']
        }
    
    return {
        "available_models": model_info,
        "total_models": len(models),
        "timestamp": pd.Timestamp.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=False,
        log_level="info"
    )
