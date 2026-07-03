"""Dev server entry point — sets WindowsSelectorEventLoopPolicy before uvicorn starts.

Windows note: reload=True spawns a child process that does not share the parent's
process group, so Ctrl+C cannot terminate it reliably. We disable reload here and
rely on manual restart instead. To re-enable: set env var UVICORN_RELOAD=1.
"""

import asyncio
import os
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import uvicorn

if __name__ == "__main__":
    reload = os.getenv("UVICORN_RELOAD", "0") == "1"
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=reload)
