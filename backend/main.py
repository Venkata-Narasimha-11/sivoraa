"""Production entrypoint module for Render and ASGI servers.
Exposes the FastAPI instance 'app' from app.main.
Runs with: uvicorn main:app --host 0.0.0.0 --port $PORT
"""

import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
