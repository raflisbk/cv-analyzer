# Backend Development Setup

## Python Environment

**This project uses Conda environment management.**

### Required Environment
- **Name:** `sbk-cv-analyzer`
- **Python:** 3.13.9
- **Package Manager:** pip (managed by Conda)

### Activating Environment

**Always activate the conda environment before running backend commands:**

```bash
conda activate sbk-cv-analyzer
```

### Verify Environment

```bash
# Check you're in the right environment
conda env list
# Should show "*" next to sbk-cv-analyzer

# Check Python version
python --version
# Should show: Python 3.13.9
```

---

## Installing Dependencies

### Phase 1 Dependencies (Backend Foundation)

Currently installed packages for Wave 1:

```bash
conda activate sbk-cv-analyzer
cd backend

# Core packages (already installed)
# - fastapi 0.135.2
# - uvicorn 0.42.0
# - celery 5.6.3
# - redis 7.4.0
# - sqlalchemy 2.0.43
# - psycopg 3.3.3
# - pydantic 2.12.5
# - pydantic-settings 2.8.0
# - alembic 1.18.4
# - loguru 0.7.3
# - boto3 1.42.83
# - sentry-sdk
# - prometheus-fastapi-instrumentator
# - slowapi
```

### Phase 2 Dependencies (Document Parsing)

**Not yet installed** - will be needed in Wave 2:

```bash
# These will be installed later:
# - PyMuPDF (PDF parsing)
# - python-docx (DOCX parsing)
# - easyocr (OCR for scanned PDFs)
# - opencv-python (Image processing)
# - pdf2image (PDF to image conversion)
# - python-magic (File type detection)
# - pillow (Image processing)
# - langdetect (Language detection)
```

**Note:** Some packages (like PyMuPDF 1.24.0) have compilation issues on Windows with Python 3.13. We'll use newer versions or binary wheels when installing for Wave 2.

---

## Running Backend Commands

### Development Server

```bash
conda activate sbk-cv-analyzer
cd backend
uvicorn app.main:app --reload
```

### Database Migrations

```bash
conda activate sbk-cv-analyzer
cd backend

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Celery Worker

```bash
conda activate sbk-cv-analyzer
cd backend
celery -A app.tasks.celery_app worker --loglevel=info
```

### Tests (when implemented)

```bash
conda activate sbk-cv-analyzer
cd backend
pytest
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cd backend
cp .env.example .env
```

Required variables (see `.env.example` for full list):
- `CV_ANALYZER_DB_HOST` - PostgreSQL host
- `CV_ANALYZER_DB_NAME` - Database name
- `CV_ANALYZER_REDIS_URL` - Redis connection URL
- `CV_ANALYZER_R2_ENDPOINT` - Cloudflare R2 endpoint
- `CV_ANALYZER_R2_ACCESS_KEY` - R2 access key
- `CV_ANALYZER_R2_SECRET_KEY` - R2 secret key

---

## Troubleshooting

### Wrong Python Version

If `python --version` shows wrong version:

```bash
# Deactivate any active environment
conda deactivate

# Reactivate sbk-cv-analyzer
conda activate sbk-cv-analyzer

# Verify
python --version
```

### Import Errors

If getting `ModuleNotFoundError`:

```bash
# Make sure you're in the right environment
conda activate sbk-cv-analyzer

# Check if package is installed
pip show package-name

# Reinstall if needed
pip install package-name
```

### VS Code Not Using Conda Environment

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type: "Python: Select Interpreter"
3. Choose: `Python 3.13.9 ('sbk-cv-analyzer': conda)`

---

## Adding New Dependencies

**Always use the conda environment:**

```bash
conda activate sbk-cv-analyzer
cd backend

# Install package
pip install package-name

# Update pyproject.toml
# Add to dependencies list in pyproject.toml

# Or update requirements.txt (if using)
pip freeze > requirements.txt
```

---

## CI/CD Notes

For GitHub Actions or other CI/CD:

```yaml
- name: Set up Conda
  uses: conda-incubator/setup-miniconda@v2
  with:
    python-version: 3.13
    environment-file: environment.yml
    activate-environment: sbk-cv-analyzer

- name: Install dependencies
  shell: bash -l {0}
  run: |
    conda activate sbk-cv-analyzer
    pip install -r backend/requirements.txt
```

---

## Quick Reference

```bash
# Activate environment
conda activate sbk-cv-analyzer

# Run dev server
cd backend && uvicorn app.main:app --reload

# Run celery worker
cd backend && celery -A app.tasks.celery_app worker --loglevel=info

# Run migrations
cd backend && alembic upgrade head

# Run tests
cd backend && pytest

# Deactivate when done
conda deactivate
```
