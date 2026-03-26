from __future__ import annotations

import os
import sys
import traceback

import uvicorn

try:
    from main import app
except Exception:
    traceback.print_exc()
    sys.exit(1)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
