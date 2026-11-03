import os
import sys
from pathlib import Path

# Set up paths so backend packages and modules are discoverable on Vercel
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent
backend_dir = root_dir / "backend"

for path in (str(backend_dir), str(root_dir)):
    if path not in sys.path:
        sys.path.insert(0, path)

# Flag environment as Vercel serverless
os.environ.setdefault("VERCEL", "1")

# Import FastAPI application instance
from app.main import app

# Vercel entrypoint exposes 'app'
__all__ = ["app"]

