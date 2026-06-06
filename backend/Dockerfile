FROM python:3.13-slim-bookworm

# System dependencies
# - weasyprint: pango, cairo, gdk-pixbuf, ffi, shared-mime-info
# - python-magic: libmagic1
# - pdf2image / poppler: poppler-utils
# - opencv headless: libgl1, libglib2.0-0
# - general build: gcc, g++
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    libmagic1 \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (cache layer)
COPY pyproject.toml .
RUN pip install --no-cache-dir -e ".[test]"

# Download spaCy English model
RUN python -m spacy download en_core_web_sm

# Copy application code
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
