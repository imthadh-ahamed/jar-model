import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import numpy as np
import pandas as pd

# Create sample data for training mock models
np.random.seed(42)
n_samples = 1000

# Generate mock water quality data
data = {
    'alkalinity': np.random.normal(200, 50, n_samples),
    'hardness': np.random.normal(200, 50, n_samples),
    'ph': np.random.normal(7, 1, n_samples),
    'solids': np.random.normal(20000, 5000, n_samples),
    'chloramines': np.random.normal(7, 2, n_samples),
    'conductivity': np.random.normal(400, 100, n_samples),
    'organic_carbon': np.random.normal(14, 3, n_samples),
    'trihalomethanes': np.random.normal(65, 15, n_samples),
    'turbidity': np.random.normal(4, 1, n_samples),
}

df = pd.DataFrame(data)

# Create target variables with some realistic relationships
# pH prediction (based on alkalinity and hardness)
ph_target = 6.5 + (df['alkalinity'] - 200) / 100 + (df['hardness'] - 200) / 200 + np.random.normal(0, 0.5, n_samples)

# Turbidity prediction (based on organic carbon and conductivity)
turbidity_target = 2 + (df['organic_carbon'] - 14) / 5 + (df['conductivity'] - 400) / 200 + np.random.normal(0, 0.3, n_samples)

# Colour prediction (based on organic carbon and turbidity)
colour_target = 10 + (df['organic_carbon'] - 14) / 2 + (df['turbidity'] - 4) / 2 + np.random.normal(0, 2, n_samples)

# Ensure positive values
ph_target = np.clip(ph_target, 1, 14)
turbidity_target = np.clip(turbidity_target, 0.1, 10)
colour_target = np.clip(colour_target, 1, 50)

# Create and train models
features = ['alkalinity', 'hardness', 'ph', 'solids', 'chloramines', 'conductivity', 'organic_carbon', 'trihalomethanes', 'turbidity']
X = df[features]

# Train pH model
ph_model = RandomForestRegressor(n_estimators=100, random_state=42)
ph_model.fit(X, ph_target)

# Train turbidity model
turbidity_model = RandomForestRegressor(n_estimators=100, random_state=42)
turbidity_model.fit(X, turbidity_target)

# Train colour model
colour_model = RandomForestRegressor(n_estimators=100, random_state=42)
colour_model.fit(X, colour_target)

# Save models
models_dir = 'e:\\jar-model\\models'
os.makedirs(models_dir, exist_ok=True)

joblib.dump(ph_model, os.path.join(models_dir, 'water_treatment_ph_model.pkl'))
joblib.dump(turbidity_model, os.path.join(models_dir, 'water_treatment_turbidity_model.pkl'))
joblib.dump(colour_model, os.path.join(models_dir, 'water_treatment_colour_model.pkl'))

print("Mock models created successfully!")
print(f"Models saved to: {models_dir}")
print("- water_treatment_ph_model.pkl")
print("- water_treatment_turbidity_model.pkl") 
print("- water_treatment_colour_model.pkl")

# Test the models
sample_input = np.array([[204.89, 204.89, 3.72, 20791.32, 7.30, 421.50, 14.28, 66.42, 4.50]])
print("\nTesting models with sample input:")
print(f"pH prediction: {ph_model.predict(sample_input)[0]:.2f}")
print(f"Turbidity prediction: {turbidity_model.predict(sample_input)[0]:.2f}")
print(f"Colour prediction: {colour_model.predict(sample_input)[0]:.2f}")
