#!/usr/bin/env bash
# Render / CI: pip install then optional training (set TRAIN_ON_BUILD=1 when API/CSV data is available).
set -euo pipefail
pip install -r requirements.txt
if [ "${TRAIN_ON_BUILD:-}" = "1" ]; then
  python train_model.py
fi
