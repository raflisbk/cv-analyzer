FROM python:3.13-slim-bookworm

# Install uv (fast Rust-based pip replacement)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# System dependencies
# - weasyprint: pango, cairo, gdk-pixbuf, ffi, shared-mime-info
# - python-magic: libmagic1
# - pdf2image / poppler: poppler-utils
# - opencv headless: libgl1, libglib2.0-0
# - general build: gcc, g++
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-noto-core \
    libmagic1 \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    libpq5 \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (cache layer).
# Editable install requires the package directory to exist; create a minimal
# stub so uv can resolve the package, then overwrite with real code below.
COPY pyproject.toml .
RUN mkdir -p app && touch app/__init__.py
RUN uv pip install --system --no-cache -e ".[test]"

# Download spaCy English model (cached after first build)
RUN python -m spacy download en_core_web_sm

# Copy application code (overwrites the stub app/__init__.py)
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
