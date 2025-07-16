from fastapi import FastAPI, Request
import joblib
import numpy as np

app = FastAPI()
model = joblib.load("random_forest_model.pkl")  # Eğittiğin modeli yükle

@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    input_data = np.array([[ 
        data["GSR"], 
        data["Nabiz"], 
        data["Piezo"],
        data["Sicaklik"], 
        data["SpO2"]
    ]])
    
    prediction = model.predict(input_data)[0]
    return {"risk": prediction}
