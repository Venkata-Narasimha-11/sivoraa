"""Root-level entrypoint module for Render and production ASGI servers.
Adds backend/ to sys.path and exposes 'app'.
"""

import sys
from pathlib import Path

# Add backend directory to Python sys.path so 'app' imports resolve seamlessly
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app  # noqa: E402

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
