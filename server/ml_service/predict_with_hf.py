import os
import base64
import requests
from typing import Optional
from fastapi import APIRouter, File, UploadFile
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
MONGO_URI = os.getenv("MONGO_URI")

LOCAL_DISEASE_URL = "http://127.0.0.1:8000/disease/predict"

HF_IMAGE_MODEL = "nlpconnect/vit-gpt2-image-captioning"
HF_TEXT_MODEL = "google/flan-t5-small"

hf_headers = {"Authorization": f"Bearer {HUGGINGFACE_TOKEN}"} if HUGGINGFACE_TOKEN else {}

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    db = client["phenopredict"]
    collection = db["disease_results"]
    print("✅ HF Service connected to MongoDB")
except Exception as e:
    print(f"❌ HF Service Mongo Error: {e}")
    db = None
    collection = None



def to_data_url(file_bytes: bytes, mime: str = "image/jpeg") -> str:
    b64 = base64.b64encode(file_bytes).decode("utf-8")
    return f"data:{mime};base64,{b64}"


def hf_caption(image_bytes: bytes) -> Optional[str]:
    if not HUGGINGFACE_TOKEN:
        return None

    url = f"https://api-inference.huggingface.co/models/{HF_IMAGE_MODEL}"

    try:
        files = {"inputs": ("image.jpg", image_bytes, "image/jpeg")}
        r = requests.post(url, headers=hf_headers, files=files, timeout=30)
        if r.status_code == 200:
            js = r.json()
            if isinstance(js, list):
                return js[0].get("generated_text")
        return None
    except:
        return None


def hf_suggestions(prompt: str) -> Optional[str]:
    if not HUGGINGFACE_TOKEN:
        return None

    url = f"https://api-inference.huggingface.co/models/{HF_TEXT_MODEL}"

    try:
        payload = {"inputs": prompt}
        r = requests.post(url, headers=hf_headers, json=payload, timeout=30)
        if r.status_code == 200:
            js = r.json()
            if isinstance(js, list):
                return js[0].get("generated_text")
        return None
    except:
        return None


@router.post("/hf/predict")
async def predict_with_hf(file: UploadFile = File(...)):

    contents = await file.read()
    mime = file.content_type or "image/jpeg"
    data_url = to_data_url(contents, mime)

    # ---- LOCAL DISEASE MODEL ----

    disease_name = None
    confidence = None

    try:
        files = {"file": (file.filename, contents, mime)}
        r = requests.post(LOCAL_DISEASE_URL, files=files, timeout=20)

        if r.ok:
            js = r.json()
            disease_name = js.get("prediction")
            confidence = js.get("confidence")
    except:
        pass

    # ---- HF CAPTION ----

    caption = hf_caption(contents)

    if not disease_name:
        disease_name = caption or "unknown disease"

    prompt = (
        f"A rice plant disease detected: {disease_name}. "
        f"Give 3 short practical treatment suggestions."
    )

    suggestions_text = hf_suggestions(prompt)

    suggestions = suggestions_text.split("\n") if suggestions_text else [
        "Remove infected leaves",
        "Avoid excess moisture",
        "Consult local agriculture officer"
    ]

    record = {
        "filename": file.filename,
        "prediction": disease_name,
        "confidence": confidence,
        "caption": caption,
        "suggestions": suggestions
    }

    try:
        if collection is not None:
            collection.insert_one(record)
    except:
        pass


    return {
        "prediction": disease_name,
        "confidence": confidence,
        "caption": caption,
        "suggestions": suggestions,
        "image_base64": data_url
    }