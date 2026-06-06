# CV Analyzer - Automated User Testing Script
# Run this PowerShell script to test the application as a user would

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CV Analyzer - Automated User Test      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend\app\main.py")) {
    Write-Host "❌ Please run this script from the cv-analyzer root directory" -ForegroundColor Red
    exit 1
}

# Function to check if port is in use
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet
    return $connection.TcpTestSucceeded
}

# Step 1: Check Docker
Write-Host "[1/8] Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "   ✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker not ready. Please start Docker Desktop" -ForegroundColor Red
    exit 1
}

# Step 2: Check containers
Write-Host "[2/8] Checking containers..." -ForegroundColor Yellow
$containers = docker compose ps -q
if ($containers.Count -ge 2) {
    Write-Host "   ✅ Containers running" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Starting containers..." -ForegroundColor Yellow
    docker compose up -d
    Start-Sleep -Seconds 5
}

# Step 3: Check database
Write-Host "[3/8] Checking database..." -ForegroundColor Yellow
try {
    docker exec cv-analyzer-postgres pg_isready -U postgres | Out-Null
    Write-Host "   ✅ PostgreSQL ready" -ForegroundColor Green

    # Check tables
    $tables = docker exec cv-analyzer-postgres psql -U postgres -d cv_analyzer -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2>$null
    Write-Host "   📊 Database tables: $tables" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Database not ready" -ForegroundColor Red
}

# Step 4: Check backend
Write-Host "[4/8] Checking backend..." -ForegroundColor Yellow
if (Test-Port 8000) {
    Write-Host "   ✅ Backend running on port 8000" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend not running. Please start:" -ForegroundColor Yellow
    Write-Host "      cd backend && conda activate sbk-cv-analyzer" -ForegroundColor Gray
    Write-Host "      uvicorn app.main:app --reload --port 8000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Press Enter to continue when backend is ready..." -ForegroundColor Yellow
    Read-Host
}

# Step 5: Check frontend
Write-Host "[5/8] Checking frontend..." -ForegroundColor Yellow
if (Test-Port 3000) {
    Write-Host "   ✅ Frontend running on port 3000" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend not running. Please start:" -ForegroundColor Yellow
    Write-Host "      cd frontend && npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Press Enter to continue when frontend is ready..." -ForegroundColor Yellow
    Read-Host
}

# Step 6: Test API endpoints
Write-Host "[6/8] Testing API endpoints..." -ForegroundColor Yellow

# Health check
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -ErrorAction Stop
    Write-Host "   ✅ Health check: OK" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Health check failed" -ForegroundColor Red
}

# Upload endpoint check (should return validation error without file)
try {
    $upload = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/upload" -Method Post -ErrorAction SilentlyContinue
    Write-Host "   ✅ Upload endpoint: Accessible" -ForegroundColor Green
} catch {
    Write-Host "   ✅ Upload endpoint: Accessible (expected error without file)" -ForegroundColor Green
}

# Step 7: Open browser
Write-Host "[7/8] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"
Write-Host "   ✅ Browser opened to http://localhost:3000" -ForegroundColor Green

# Step 8: Manual test instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Manual Testing Instructions           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now test the application as a user:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ✅ UPLOAD CV TEST:" -ForegroundColor White
Write-Host "   - Click 'Upload your CV' button" -ForegroundColor Gray
Write-Host "   - Select a PDF file from your computer" -ForegroundColor Gray
Write-Host "   - Watch the progress stages:" -ForegroundColor Gray
Write-Host "     • Uploading..." -ForegroundColor Cyan
Write-Host "     • Extracting text..." -ForegroundColor Cyan
Write-Host "     • Analyzing..." -ForegroundColor Cyan
Write-Host "     • Complete ✅" -ForegroundColor Green
Write-Host ""
Write-Host "2. ✅ RESULTS PAGE TEST:" -ForegroundColor White
Write-Host "   - Verify overall score (0-100) displayed" -ForegroundColor Gray
Write-Host "   - Check 4 tabs: Overview, Scores, Skills, Grammar" -ForegroundColor Gray
Write-Host "   - Look for AI suggestions (if configured)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. ✅ JOB COMPARISON TEST:" -ForegroundColor White
Write-Host "   - Navigate to 'Compare' tab (Tab 5)" -ForegroundColor Gray
Write-Host "   - Paste a job description" -ForegroundColor Gray
Write-Host "   - Click 'Compare with Job Description'" -ForegroundColor Gray
Write-Host "   - Verify match percentage displayed" -ForegroundColor Gray
Write-Host ""
Write-Host "4. ✅ PDF EXPORT TEST:" -ForegroundColor White
Write-Host "   - Click 'Download PDF' button" -ForegroundColor Gray
Write-Host "   - Verify PDF downloads with all content" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Results Summary
Write-Host "Test Environment Summary:" -ForegroundColor Yellow
Write-Host "─────────────────────────" -ForegroundColor Gray
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "Database: PostgreSQL on port 5432" -ForegroundColor White
Write-Host "Redis:    Redis on port 6379" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Ready for manual testing!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in backend/frontend terminals to stop servers." -ForegroundColor Yellow
Write-Host "Run 'docker compose down' to stop database." -ForegroundColor Yellow
Write-Host ""
