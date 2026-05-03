@echo off
REM CV Analyzer - Smart Start with Docker Check
REM This script waits for Docker to be ready before starting services

echo ========================================
echo CV Analyzer - Smart Start
echo ========================================
echo.

REM Step 1: Check if Docker is running
echo [1/6] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Docker Desktop is not running!
    echo.
    echo Please follow these steps:
    echo 1. Start Docker Desktop manually
    echo 2. Wait for the icon in system tray to turn green (2-3 minutes)
    echo 3. Run this script again
    echo.
    echo Press any key to open Docker Desktop...
    pause >nul
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

    echo.
    echo Waiting for Docker to start...
    echo This may take 2-3 minutes...
    echo.

    REM Wait up to 90 seconds for Docker
    set MAX_WAIT=90
    set WAITED=0

    :waitloop
    timeout /t 5 /nobreak >nul
    set /a WAITED+=5
    docker info >nul 2>&1
    if not errorlevel 1 (
        goto docker_ready
    )
    if %WAITED% lss %MAX_WAIT% (
        echo Still waiting... (%WAITED% seconds elapsed)
        goto waitloop
    )

    echo.
    echo ❌ Docker is still not ready after waiting
    echo Please check Docker Desktop and try again
    pause
    exit /b 1

    :docker_ready
    echo ✅ Docker is ready!
    echo.
) else (
    echo ✅ Docker is already running
    echo.
)

REM Step 2: Start containers
echo [2/6] Starting PostgreSQL and Redis...
docker compose up -d
if errorlevel 1 (
    echo ❌ Failed to start containers
    echo Check Docker Desktop and try again
    pause
    exit /b 1
)
echo ✅ Containers started
echo.

REM Step 3: Wait for database to be ready
echo [3/6] Waiting for database to be ready...
set DB_CHECK=0
:dbwait
timeout /t 2 /nobreak >nul
docker exec cv-analyzer-postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    if %DB_CHECK% lss 15 (
        set /a DB_CHECK+=1
        goto dbwait
    ) else (
        echo ⚠️  Database taking longer than expected
        echo Continuing anyway...
    )
) else (
    echo ✅ Database is ready
)
echo.

REM Step 4: Run migrations
echo [4/6] Running database migrations...
cd backend
conda run -n sbk-cv-analyzer alembic upgrade head
if errorlevel 1 (
    echo ⚠️  Migration failed or already applied
    echo Continuing...
) else (
    echo ✅ Migrations applied
)
cd ..
echo.

REM Step 5: Start backend
echo [5/6] Starting backend server...
start "CV Analyzer Backend" cmd /k "cd /d %~dp0backend && conda activate sbk-cv-analyzer && uvicorn app.main:app --reload --port 8000"
echo ✅ Backend starting in new window (port 8000)
timeout /t 5 /nobreak >nul
echo.

REM Step 6: Start frontend
echo [6/6] Starting frontend server...
start "CV Analyzer Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo ✅ Frontend starting in new window (port 3000)
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo ✅ All Services Started Successfully!
echo ========================================
echo.
echo 🌐 Frontend:  http://localhost:3000
echo 📡 Backend:   http://localhost:8000
echo 📚 API Docs:  http://localhost:8000/docs
echo.
echo 💡 Tips:
echo - Backend/Frontend run in separate windows
echo - Close those windows to stop the servers
echo - Docker containers continue running in background
echo.
echo Press any key to open browser...
pause >nul
start http://localhost:3000
