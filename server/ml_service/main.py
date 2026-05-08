from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ml_service import router as ml_router
from disease_api import router as disease_router
from predict_with_hf import router as hf_router

app = FastAPI(title="Unified ML Service")

# ---- GLOBAL CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- ROUTERS ----
app.include_router(ml_router)
app.include_router(disease_router)
app.include_router(hf_router)

@app.get("/")
def health():
    return {"status": "ML unified server running"}