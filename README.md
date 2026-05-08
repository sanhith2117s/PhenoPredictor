# Pheno-Predict 🌾

**Pheno-Predict** is an advanced, multi-service machine learning ecosystem designed for precision agriculture, specifically optimized for rice crop analytics. It integrates genomic trait prediction, plant disease detection, and AI-driven advisory services into a unified, high-performance web interface.

---

## 🚀 Core Features

### 🧬 Genomic Trait Predictor
*   **Engine**: High-performance XGBoost models.
*   **Functionality**: Predicts 12+ critical rice traits (e.g., Grain Length, Shoot Diameter, Tiller Number) from SNP genomic markers.
*   **Input**: Genotype CSV files.
*   **Output**: Mean predictions, confidence ranges, and sample data streams.

### 🔍 Disease Detection Core
*   **Engine**: TensorFlow / Keras (CNN).
*   **Functionality**: Detects 4 major rice diseases (Bacterial Blight, Blast, Brown Spot, Tungro) from leaf imagery.
*   **Accuracy**: Phase-1 optimized model with high precision.

### 🤖 AI Advisory System
*   **Engine**: HuggingFace Inference API (google/flan-t5 & vit-gpt2).
*   **Functionality**: Generates automated image captions and provides 3-point practical treatment suggestions for detected diseases.

---

## 🛠️ Architecture

*   **Frontend**: React (Vite) + Tailwind CSS + Framer Motion (for premium animations).
*   **Backend API**: Node.js + Express + MongoDB Atlas (History tracking).
*   **ML Microservices**: FastAPI (Python) unified server.

---

## ⚙️ Setup & Installation

### **Prerequisites**
*   Node.js (v18+)
*   Python (3.10+)
*   MongoDB Atlas Account
*   HuggingFace API Token

### **1. Clone & Install Dependencies**
```bash
# Frontend
cd client && npm install

# Backend
cd server && npm install

# ML Service
cd server/ml_service && pip install -r requirements.txt
```

### **2. Environment Configuration**
Ensure `.env` files are present in `client/`, `server/`, and `server/ml_service/`.

*   **Client**: `VITE_API_URL=http://localhost:5001`, `VITE_ML_URL=http://localhost:8000`
*   **Server**: `MONGO_URI`, `PORT=5001`
*   **ML Service**: `MONGO_URI`, `HUGGINGFACE_API_TOKEN`

---

## 🏁 How to Run

You need three terminal windows running simultaneously:

### **Step A: Start the ML Node**
```bash
cd server/ml_service
./start_servers.bat
# Or manually: python -m uvicorn main:app --reload --port 8000
```

### **Step B: Start the Backend Server**
```bash
cd server
npm run dev
```

### **Step C: Start the Web Dashboard**
```bash
cd client
npm run dev
```

---

## 📝 Usage Guide
1.  **Dashboard**: Overview of analytics.
2.  **Trait Predictor**: Upload your SNP CSV file to see genomic predictions.
3.  **Disease Predictor**: Upload an image of an infected leaf to get a diagnosis and treatment plan.
4.  **Visualize**: Browse your historical prediction logs with interactive charts.

---

Developed **Snehith-Reddy** for the **Pheno-Predict** project.
