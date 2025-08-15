#!/usr/bin/env bash
set -euo pipefail
python -m pip install --upgrade pip setuptools wheel
pip install --no-cache-dir -r requirements.txt
