# Development Quick Reference

## Environment Setup

### Backend (Always use Conda!)
```bash
# Activate environment - DO THIS FIRST!
conda activate sbk-cv-analyzer

# Verify
python --version  # Should show 3.13.9
```

### Frontend
```bash
cd frontend
npm install  # Install dependencies
```

---

## Code Quality

### Backend Linting
```bash
conda activate sbk-cv-analyzer
cd backend

# Format code (auto-fix)
black .

# Lint code
ruff check .

# Fix auto-fixable issues
ruff check --fix .

# Type check (when configured)
mypy app/
```

### Frontend Linting
```bash
cd frontend

# Lint
npm run lint

# Format
npx prettier --write .

# Type check
npx tsc --noEmit

# Build check
npm run build
```

---

## Running Services

### Backend API
```bash
conda activate sbk-cv-analyzer
cd backend
uvicorn app.main:app --reload
# Server: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend Dev Server
```bash
cd frontend
npm run dev
# Server: http://localhost:3000
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

---

## Wave Completion Checklist

After each wave execution:

**1. Review Files**
```bash
git status
```

**2. Update .gitignore**
- Check for new log files, temp files, cache directories
- Add any sensitive data patterns

**3. Lint Code**
```bash
# Backend
conda activate sbk-cv-analyzer
cd backend
black .
ruff check --fix .

# Frontend
cd frontend
npm run lint
npx prettier --write .
```

**4. Verify Builds**
```bash
# Backend
conda activate sbk-cv-analyzer
cd backend
python -c "from app.main import app; print('✓ OK')"

# Frontend
cd frontend
npm run build
```

**5. Commit**
```bash
git add .
git commit -m "feat: wave X - description"
```

---

## Common Issues

### "ModuleNotFoundError" in Backend
```bash
# Make sure conda env is activated
conda activate sbk-cv-analyzer
conda env list  # Check for *
```

### "Command not found: black/ruff"
```bash
conda activate sbk-cv-analyzer
pip install black ruff
```

### "ESLint not found" in Frontend
```bash
cd frontend
npm install
```

### Import Errors
```bash
# Backend - check conda env
conda activate sbk-cv-analyzer
pip list | grep fastapi

# Frontend - reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## File Structure

```
cv-analyzer/
├── backend/
│   ├── app/              # Main application code
│   ├── tests/            # Test files
│   ├── alembic/          # Database migrations
│   ├── pyproject.toml    # Dependencies + Black/Ruff config
│   ├── requirements.txt  # Pinned dependencies
│   └── .env.example      # Environment template
├── frontend/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utilities and types
│   ├── .eslintrc.json    # ESLint config
│   └── package.json      # Dependencies
├── .github/
│   ├── copilot-instructions.md  # Main project guide
│   └── BACKEND_SETUP.md         # Conda setup guide
├── .gitignore            # Git ignore patterns
└── .planning/            # GSD workflow (not committed)
```

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/pyproject.toml` | Python dependencies, Black config, Ruff config |
| `backend/requirements.txt` | Pinned Python dependencies |
| `backend/.env` | Environment variables (NOT committed) |
| `frontend/.eslintrc.json` | ESLint rules |
| `frontend/package.json` | Node dependencies |
| `frontend/tsconfig.json` | TypeScript config |
| `.gitignore` | Files to ignore in git |
| `.github/copilot-instructions.md` | Project conventions and rules |

---

## GSD Workflow

```bash
# Plan a phase
/gsd-plan-phase 1

# Execute a phase
/gsd-execute-phase 1

# Execute specific wave
/gsd-execute-phase 1 --wave 1

# Execute specific plan
/gsd-execute-plan 01-01-PLAN.md

# Check progress
/gsd-progress

# List running agents
/tasks
```
