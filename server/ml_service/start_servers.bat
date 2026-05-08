@echo off
echo Starting Unified ML Service...
python -m uvicorn main:app --reload --port 8000
pause
