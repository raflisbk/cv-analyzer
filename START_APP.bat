@echo off
REM CV Analyzer - Quick Start Script
REM Run this script to start all services for testing

echo ========================================
echo CV Analyzer - Quick Start
echo ========================================
echo.

REM Step 1: Check Docker
echo [1/5] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not ready. Please start Docker Desktop and wait 2 minutes.
    pause
    exit /b 1
)
echo ✅ Docker is ready
echo.

REM Step 2: Start containers
echo [2/5] Starting PostgreSQL and Redis...
docker compose up -d
if errorlevel 1 (
    echo ❌ Failed to start containers
    pause
    exit /b 1
)
echo ✅ Containers started
timeout /t 3 /nobreak >nul
echo.

REM Step 3: Run migrations
echo [3/5] Running database migrations...
cd backend
conda run -n sbk-cv-analyzer alembic upgrade head
if errorlevel 1 (
    echo ⚠️ Migration failed or already applied
)
echo ✅ Database ready
cd ..
echo.

REM Step 4: Start backend (in new window)
echo [4/5] Starting backend server...
start "CV Analyzer Backend" cmd /k "cd backend && conda activate sbk-cv-analyzer && uvicorn app.main:app --reload --port 8000"
echo ✅ Backend starting in new window (port 8000)
timeout /t 5 /nobreak >nul
echo.

REM Step 5: Start frontend (in new window)
echo [5/5] Starting frontend server...
start "CV Analyzer Frontend" cmd /k "cd frontend && npm run dev"
echo ✅ Frontend starting in new window (port 3000)
echo.

echo ========================================
echo ✅ All services started!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 📡 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C in each window to stop servers.
echo Press any key to open browser...
pause >nul
start http://localhost:3000
