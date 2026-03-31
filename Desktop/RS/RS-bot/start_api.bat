@echo off
echo Starting RozgarSetu RS-Bot API on port 8001...
cd /d "%~dp0"
python -m uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
