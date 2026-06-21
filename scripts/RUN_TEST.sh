#!/bin/bash
# CV Analyzer - Automated Test Runner
# Simulates user behavior for end-to-end testing

set -e

echo "🧪 CV Analyzer - Automated Test Runner"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# Test 1: Check Docker
echo "Test 1: Docker Environment"
echo "----------------------------"
if docker info >/dev/null 2>&1; then
    pass "Docker daemon running"
else
    fail "Docker daemon not running"
    echo "Please start Docker Desktop and wait 2 minutes"
    exit 1
fi

# Test 2: Check containers
echo ""
echo "Test 2: Docker Containers"
echo "-------------------------"
CONTAINERS=$(docker compose ps -q 2>/dev/null | wc -l)
if [ "$CONTAINERS" -ge 2 ]; then
    pass "Docker containers running ($CONTAINERS containers)"
else
    fail "Not enough containers running (expected 2+, got $CONTAINERS)"
    echo "Run: docker compose up -d"
fi

# Test 3: Database connection
echo ""
echo "Test 3: Database Connection"
echo "---------------------------"
if docker exec cv-analyzer-postgres pg_isready -U postgres >/dev/null 2>&1; then
    pass "PostgreSQL is ready"
else
    fail "PostgreSQL not ready"
fi

# Test 4: Backend health
echo ""
echo "Test 4: Backend Health Check"
echo "---------------------------"
sleep 2  # Give backend time to start
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    pass "Backend health check OK"
else
    fail "Backend not responding on port 8000"
    echo "Run: cd backend && uvicorn app.main:app --reload"
fi

# Test 5: API docs
echo ""
echo "Test 5: API Documentation"
echo "------------------------"
if curl -s http://localhost:8000/docs >/dev/null 2>&1; then
    pass "API docs accessible"
else
    warn "API docs not accessible"
fi

# Test 6: Frontend
echo ""
echo "Test 6: Frontend Server"
echo "-----------------------"
if curl -s -I http://localhost:3000 >/dev/null 2>&1; then
    pass "Frontend responding on port 3000"
else
    fail "Frontend not responding"
    echo "Run: cd frontend && npm run dev"
fi

# Test 7: Upload endpoint
echo ""
echo "Test 7: Upload Endpoint"
echo "-----------------------"
UPLOAD_TEST=$(curl -s -X POST http://localhost:8000/api/v1/upload 2>&1)
if echo "$UPLOAD_TEST" | grep -q "detail\|error\|422"; then
    pass "Upload endpoint responds (expects file)"
else
    warn "Upload endpoint response unclear"
fi

# Test 8: Database tables
echo ""
echo "Test 8: Database Schema"
echo "-----------------------"
TABLES=$(docker exec cv-analyzer-postgres psql -U postgres -d cv_analyzer -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null | xargs)
if [ "$TABLES" -ge 3 ]; then
    pass "Database tables exist ($TABLES tables)"
else
    fail "Not enough tables (expected 3+, got $TABLES)"
    echo "Run: cd backend && alembic upgrade head"
fi

# Test 9: pgvector extension
echo ""
echo "Test 9: pgvector Extension"
echo "-------------------------"
PGVECTOR=$(docker exec cv-analyzer-postgres psql -U postgres -d cv_analyzer -t -c "SELECT COUNT(*) FROM pg_extension WHERE extname='vector'" 2>/dev/null | xargs)
if [ "$PGVECTOR" = "1" ]; then
    pass "pgvector extension installed"
else
    fail "pgvector extension not found"
fi

# Test 10: Knowledge chunks table
echo ""
echo "Test 10: RAG Knowledge Base"
echo "--------------------------"
KNOWLEDGE_TABLE=$(docker exec cv-analyzer-postgres psql -U postgres -d cv_analyzer -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='knowledge_chunks'" 2>/dev/null | xargs)
if [ "$KNOWLEDGE_TABLE" = "1" ]; then
    pass "knowledge_chunks table exists"
else
    fail "knowledge_chunks table missing"
fi

# Summary
echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "🚀 Ready for manual testing:"
    echo "   Open http://localhost:3000"
    echo "   Upload a CV and observe the analysis flow"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    echo "Please fix the issues above before manual testing"
    echo ""
    exit 1
fi
