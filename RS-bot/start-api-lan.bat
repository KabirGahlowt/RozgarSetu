@echo off
cd /d "%~dp0"
echo RS Bot API on 0.0.0.0:8001 (reachable from phone on same Wi-Fi)
python -m uvicorn api.main:app --host 0.0.0.0 --port 8001
pause
