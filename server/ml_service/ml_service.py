import os
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb

from fastapi import APIRouter, File, UploadFile, Form
from pymongo import MongoClient

from dotenv import load_dotenv
load_dotenv()

# ------------------ ROUTER ------------------

router = APIRouter()

# ------------------ MONGO ------------------

MONGO_URI = os.getenv("MONGO_URI")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Trigger a quick check
    client.admin.command('ping')
    db = client["phenopredict"]
    results_collection = db["trait_results"]
    print("✅ Connected to MongoDB Atlas")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")
    print("⚠️  Running without database persistence.")
    db = None
    results_collection = None



# ------------------ MODEL LOADING ------------------

MODEL_DIR = "multi_trait_models"
models = {}
snp_columns_map = {}

print("🔍 Loading models from:", os.path.abspath(MODEL_DIR))

if os.path.exists(MODEL_DIR):
    for trait in os.listdir(MODEL_DIR):
        trait_folder = os.path.join(MODEL_DIR, trait)
        model_path = os.path.join(trait_folder, f"{trait}_xgb.json")
        columns_path = os.path.join(trait_folder, "snp_columns.joblib")

        if os.path.isfile(model_path) and os.path.isfile(columns_path):
            try:
                model = xgb.XGBRegressor()
                model.load_model(model_path)
                snp_cols = joblib.load(columns_path)

                models[trait] = model
                snp_columns_map[trait] = snp_cols
                print(f"✅ Loaded {trait}")
            except Exception as e:
                print(f"❌ Failed loading {trait}: {e}")
else:
    print("⚠ MODEL_DIR missing")

# ------------------ HEALTH ------------------

@router.get("/ml")
def root():
    return {
        "status": "ML router running",
        "loaded_traits": list(models.keys())
    }

# ------------------ SINGLE TRAIT ------------------

@router.post("/ml/predict")
async def predict_single_trait(
    file: UploadFile = File(...),
    trait: str = Form(...)
):
    if trait not in models:
        return {"error": f"{trait} not available"}

    df = pd.read_csv(file.file)

    required_cols = snp_columns_map[trait]
    missing = [c for c in required_cols if c not in df.columns]

    if missing:
        return {"error": f"Missing columns example {missing[:5]}"}

    X = df[required_cols].astype("float32")
    preds = models[trait].predict(X).astype(float)

    return {
        "trait": trait,
        "mean_prediction": float(np.mean(preds)),
        "sample_predictions": preds.tolist(),
        "num_samples": len(preds),
        "min_prediction": float(np.min(preds)),
        "max_prediction": float(np.max(preds))
    }


# ------------------ MULTI TRAIT ------------------

@router.post("/ml/predict_all")
async def predict_all_traits(
    file: UploadFile = File(...)
):
    if not models:
        return {"error": "No models loaded"}

    df = pd.read_csv(file.file)

    results = {}

    for trait, model in models.items():
        required_cols = snp_columns_map[trait]
        missing = [c for c in required_cols if c not in df.columns]

        if missing:
            results[trait] = {"error": "missing columns"}
            continue

        X = df[required_cols].astype("float32")
        preds = model.predict(X).astype(float)

        results[trait] = {
            "mean_prediction": float(np.mean(preds)),
            "sample_predictions": preds[:20].tolist(),
            "num_samples": len(preds),
            "min_prediction": float(np.min(preds)),
            "max_prediction": float(np.max(preds))
        }

    return {"traits": results}