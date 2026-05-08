from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import io
import tensorflow as tf
import os

router = APIRouter()

MODEL_PATH = os.path.abspath("best_phase1.keras")
IMAGE_SIZE = (224, 224)
CLASS_LABELS = ['Bacterialblight','Blast','Brownspot','Tungro']

# -------- LOAD MODEL --------

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Disease model loaded")
except Exception as e:
    print("❌ Model load failed:", e)
    model = None


def preprocess_image_bytes(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMAGE_SIZE)
    arr = np.asarray(img).astype("float32") / 255.0
    return np.expand_dims(arr, axis=0)


# -------- ROUTE --------

@router.post("/disease/predict")
async def predict_disease(file: UploadFile = File(...)):

    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    filename = file.filename.lower()
    if not any(filename.endswith(ext) for ext in (".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Invalid image")

    contents = await file.read()
    x = preprocess_image_bytes(contents)

    preds = model.predict(x)
    preds = np.asarray(preds).squeeze()

    if preds.ndim == 0:
        label = str(preds)
        confidence = float(preds)
    else:
        exp = np.exp(preds - np.max(preds))
        probs = exp / exp.sum()

        idx = int(np.argmax(probs))
        label = CLASS_LABELS[idx]
        confidence = float(probs[idx])

    return JSONResponse({
        "prediction": label,
        "confidence": round(confidence, 6)
    })