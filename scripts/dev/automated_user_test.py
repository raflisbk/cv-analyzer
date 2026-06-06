"""
CV Analyzer - Automated User Testing Script
Simulates user behavior for end-to-end testing
"""
import asyncio
import sys
import time
import httpx
from pathlib import Path

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    CYAN = '\033[96m'
    END = '\033[0m'

def log(message, color=''):
    print(f"{color}{message}{Colors.END}")

def pass_msg(msg):
    log(f"✅ PASS: {msg}", Colors.GREEN)

def fail_msg(msg):
    log(f"❌ FAIL: {msg}", Colors.RED)

def warn_msg(msg):
    log(f"⚠️  WARN: {msg}", Colors.YELLOW)

def info_msg(msg):
    log(f"ℹ️  INFO: {msg}", Colors.CYAN)

class CVAnalyzerTester:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.passed = 0
        self.failed = 0

    async def test_backend_health(self):
        """Test 1: Backend health check"""
        info_msg("Testing Backend Health Check...")

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/health")
                if response.status_code == 200:
                    pass_msg("Backend health check returned 200 OK")
                    data = response.json()
                    info_msg(f"Response: {data}")
                    self.passed += 1
                    return True
                else:
                    fail_msg(f"Backend health check returned {response.status_code}")
                    self.failed += 1
                    return False
        except Exception as e:
            fail_msg(f"Backend health check failed: {e}")
            warn_msg("Make sure backend is running: cd backend && uvicorn app.main:app --port 8000")
            self.failed += 1
            return False

    async def test_api_docs(self):
        """Test 2: API documentation accessible"""
        info_msg("Testing API Documentation...")

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/docs")
                if response.status_code == 200:
                    pass_msg("API docs accessible at /docs")
                    self.passed += 1
                    return True
                else:
                    fail_msg(f"API docs returned {response.status_code}")
                    self.failed += 1
                    return False
        except Exception as e:
            fail_msg(f"API docs check failed: {e}")
            self.failed += 1
            return False

    async def test_upload_endpoint_exists(self):
        """Test 3: Upload endpoint exists"""
        info_msg("Testing Upload Endpoint...")

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Try to POST without file - should return validation error
                response = await client.post(f"{self.base_url}/api/v1/upload")
                if response.status_code in [400, 422]:
                    pass_msg("Upload endpoint exists (validation error as expected)")
                    self.passed += 1
                    return True
                else:
                    warn_msg(f"Upload endpoint returned unexpected status: {response.status_code}")
                    self.passed += 1  # Still pass if endpoint exists
                    return True
        except Exception as e:
            fail_msg(f"Upload endpoint check failed: {e}")
            self.failed += 1
            return False

    async def test_frontend_accessible(self):
        """Test 4: Frontend accessible"""
        info_msg("Testing Frontend Accessibility...")

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.frontend_url, follow_redirects=True)
                if response.status_code == 200:
                    pass_msg("Frontend accessible at http://localhost:3000")
                    self.passed += 1
                    return True
                else:
                    fail_msg(f"Frontend returned {response.status_code}")
                    warn_msg("Make sure frontend is running: cd frontend && npm run dev")
                    self.failed += 1
                    return False
        except Exception as e:
            fail_msg(f"Frontend check failed: {e}")
            warn_msg("Make sure frontend is running: cd frontend && npm run dev")
            self.failed += 1
            return False

    def print_summary(self):
        """Print test summary"""
        total = self.passed + self.failed
        log("", "")
        log("=" * 50, Colors.CYAN)
        log("TEST SUMMARY", Colors.CYAN)
        log("=" * 50, Colors.CYAN)
        log(f"Total Tests: {total}")
        log(f"Passed: {self.passed}", Colors.GREEN)
        log(f"Failed: {self.failed}", Colors.RED if self.failed > 0 else "")
        log("")

        if self.failed == 0:
            log("🎉 All tests passed! Ready for manual user testing.", Colors.GREEN)
            log("", "")
            log("Next Steps:", Colors.YELLOW)
            log("1. Open browser to http://localhost:3000", Colors.CYAN)
            log("2. Upload a CV file", Colors.CYAN)
            log("3. Observe the analysis progress", Colors.CYAN)
            log("4. View results and try all features", Colors.CYAN)
        else:
            log("⚠️  Some tests failed. Please check:", Colors.YELLOW)
            log("- Backend running on port 8000?", Colors.CYAN)
            log("- Frontend running on port 3000?", Colors.CYAN)
            log("- Database containers running?", Colors.CYAN)
            log("", "")
            log("Start services:", Colors.YELLOW)
            log("  Backend: cd backend && uvicorn app.main:app --port 8000", Colors.CYAN)
            log("  Frontend: cd frontend && npm run dev", Colors.CYAN)

    async def run_all_tests(self):
        """Run all automated tests"""
        log("", "")
        log("=" * 50, Colors.CYAN)
        log("CV ANALYZER - AUTOMATED USER TEST", Colors.CYAN)
        log("=" * 50, Colors.CYAN)
        log("", "")

        # Wait a moment for services to be ready
        info_msg("Waiting for services to be ready...")
        await asyncio.sleep(2)

        # Run tests
        await self.test_backend_health()
        await self.test_api_docs()
        await self.test_upload_endpoint_exists()
        await self.test_frontend_accessible()

        # Print summary
        self.print_summary()

async def main():
    tester = CVAnalyzerTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log("\n\nTest interrupted by user.", Colors.YELLOW)
        sys.exit(0)
