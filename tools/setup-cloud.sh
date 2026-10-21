#!/usr/bin/env bash
set -euo pipefail
cd /workspace/Ein-Tag-als-Ranger
command -v node >/dev/null || { echo 'Node.js muss im PATH verfügbar sein.' >&2; exit 1; }
node --version
python3 --version
python3 -m venv /workspace/.ranger-venv --system-site-packages
PIP_CACHE_DIR=/workspace/.ranger-pip-cache /workspace/.ranger-venv/bin/python -m pip install --disable-pip-version-check -r tools/requirements-dev.txt
/workspace/.ranger-venv/bin/python - <<'PY'
import importlib.metadata,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
for package in ['Pillow','playwright']:
    print(package,importlib.metadata.version(package))
with sync_playwright() as p:
    assert shutil.which('chromium') or Path(p.chromium.executable_path).is_file(), 'Chromium fehlt: python -m playwright install chromium ausführen.'
print('Browserwerkzeug verfügbar. Kein npm-Installationsschritt erforderlich.')
PY
