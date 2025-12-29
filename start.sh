#!/usr/bin/env bash
set -e
PORT=${PORT:-8000}
if command -v python3 >/dev/null 2>&1; then
  echo "Serving at http://localhost:$PORT (Python 3 http.server)"
  python3 -m http.server "$PORT"
else
  echo "Python 3 not found. Install Python 3 or use 'npm start' with Node.js."
  exit 1
fi
