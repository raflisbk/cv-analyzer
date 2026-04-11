# Manual Test Plan: CV Analyzer (User Perspective)

**Created:** 2026-04-08
**Objective:** Test complete user journey from CV upload to analysis results
**Tester:** Automated (Claude) simulating real user behavior

---

## Test Environment Setup

### Prerequisites
```bash
# 1. Start Docker Desktop (wait ~2 minutes for full startup)
# 2. Start services
docker compose up -d

# 3. Wait for database to be ready
docker compose ps

# 4. Run migrations
cd backend
conda run -n sbk-cv-analyzer alembic upgrade head

# 5. Start backend (terminal 1)
cd backend
conda run -n sbk-cv-analyzer uvicorn app.main:app --reload --port 8000

# 6. Start frontend (terminal 2)
cd frontend
npm run dev
```

### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: postgresql://postgres:postgres@localhost:5432/cv_analyzer
- Redis: redis://localhost:6379/0

---

## Test Scenarios

### Scenario 1: First-Time User - Basic CV Upload

**User Story:** As a first-time user, I want to upload my CV and get instant analysis

#### Steps
1. **Navigate to application**
   - Open browser to http://localhost:3000
   - Verify homepage loads with title "CV Analyzer"
   - Verify upload section is visible and prominent

2. **Upload CV file**
   - Click "Upload your CV" button or drag-and-drop zone
   - Select a sample PDF file (e.g., `test-cv-alex-chen.pdf`)
   - Verify file selection preview shows filename and size

3. **Observe processing stages**
   - Verify "Uploading..." stage appears with progress indicator
   - Verify "Extracting text..." stage appears
   - Verify "Analyzing..." stage appears
   - Verify "Complete" stage appears (not "Failed")
   - Total time should be < 30 seconds

4. **View results page**
   - Verify redirect to `/results/{job_id}` page
   - Verify 4 tabs are visible: Overview, Scores, Skills, Grammar

5. **Check Overview tab**
   - Verify overall score displayed (0-100 gauge chart)
   - Verify score breakdown shown (Clarity, Impact, Completeness, Relevance)
   - Verify "AI Improvement Suggestions" section exists
   - Verify suggestion cards displayed (if LLM configured)
   - Verify "Download PDF" button exists
   - Verify "Copy suggestions" button exists

6. **Check Scores tab**
   - Verify 4 dimension scores shown with visual charts
   - Verify each score has explanation text

7. **Check Skills tab**
   - Verify extracted skills listed
   - Verify skill categories (Technical, Soft Skills, etc.)

8. **Check Grammar tab**
   - Verify grammar issues listed (if any found)
   - Verify ATS checklist shown

**Expected Results:**
- ✅ All stages complete successfully
- ✅ Results page displays all sections
- ✅ No error messages shown to user
- ✅ Overall score calculated and displayed

---

### Scenario 2: User Uploads Invalid File

**User Story:** As a user, I want clear feedback when I upload an invalid file

#### Steps
1. Try uploading a non-PDF file (.exe, .zip, etc.)
2. Verify error message: "Invalid file type. Please upload PDF or DOCX."
3. Try uploading a file > 5MB
4. Verify error message: "File too large. Maximum size is 5MB."
5. Try uploading a corrupted PDF
6. Verify graceful error handling with "Failed" stage

**Expected Results:**
- ✅ Clear error messages
- ✅ Application doesn't crash
- ✅ User can retry with valid file

---

### Scenario 3: User with Job Description Comparison

**User Story:** As a user, I want to compare my CV against a job description

#### Steps
1. Upload a CV file and wait for analysis
2. On results page, navigate to "Compare" tab (Tab 5)
3. Verify job description input area
4. Paste a sample job description
5. Click "Compare with Job Description"
6. Wait for comparison analysis
7. Verify match percentage displayed
8. Verify skills gap heatmap shown
9. Verify missing qualifications listed

**Expected Results:**
- ✅ Match percentage calculated (0-100%)
- ✅ Visual heatmap displayed
- ✅ Actionable feedback provided

---

### Scenario 4: Real-Time Progress Updates

**User Story:** As a user, I want to see real-time progress updates during analysis

#### Steps
1. Upload CV file
2. Observe SSE (Server-Sent Events) connection
3. Verify stage transitions happen smoothly:
   - `uploading` → `extracting` → `analyzing` → `generating` → `complete`
4. Verify each stage shows appropriate label
5. Verify progress indicator updates smoothly
6. Verify no "stuck" stages (> 2 minutes on one stage)

**Expected Results:**
- ✅ Smooth stage transitions
- ✅ No frozen or stuck states
- ✅ User sees continuous feedback

---

### Scenario 5: PDF Export Functionality

**User Story:** As a user, I want to download my analysis results as PDF

#### Steps
1. Complete CV analysis
2. Click "Download PDF" button on results page
3. Verify PDF download starts automatically
4. Open downloaded PDF
5. Verify all sections included:
   - Overall score
   - Dimension breakdowns
   - Skills extracted
   - Grammar feedback
   - AI suggestions (if available)
6. Verify PDF formatting is clean and professional

**Expected Results:**
- ✅ PDF downloads successfully
- ✅ All content included
- ✅ Professional formatting

---

### Scenario 6: Rate Limiting

**User Story:** As a user, I should be prevented from abusing the system

#### Steps
1. Upload 5 CVs rapidly (within 1 hour)
2. On 6th attempt, verify rate limit message
3. Verify helpful message: "Rate limit exceeded. Please try again later."

**Expected Results:**
- ✅ Rate limit enforced (5 uploads/hour)
- ✅ Clear error message
- ✅ No system abuse possible

---

### Scenario 7: Mobile Responsiveness

**User Story:** As a user, I want to use the app on my mobile device

#### Steps
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test various screen sizes:
   - Mobile (375px width)
   - Tablet (768px width)
   - Desktop (1920px width)
4. Verify UI adapts to each size
5. Verify touch targets are large enough (> 44px)
6. Verify text is readable without zooming

**Expected Results:**
- ✅ Responsive layout works
- ✅ No horizontal scrolling on mobile
- ✅ Touch-friendly interface

---

### Scenario 8: Error Recovery

**User Story:** As a user, I want the app to recover gracefully from errors

#### Steps
1. Start a CV upload
2. Simulate network error (disconnect internet during upload)
3. Verify error message shown
4. Reconnect network
5. Upload a new CV
6. Verify app recovers and processes successfully

**Expected Results:**
- ✅ Graceful error handling
- ✅ User can retry after error
- ✅ No app crash or freeze

---

## Test Data

### Sample CV Files
- `test-cv-alex-chen.pdf` - Well-formatted technical CV
- `test-cv-simple.pdf` - Simple CV with basic sections
- `test-cv-scan.pdf` - Scanned PDF (tests OCR)
- `test-cv-international.pdf` - Non-US format (EU template)

### Sample Job Descriptions
- `job-senior-frontend.txt` - Senior Frontend Developer role
- `job-ml-engineer.txt` - Machine Learning Engineer role
- `job-fullstack.txt` - Full Stack Developer role

---

## Success Criteria

### Must Pass (Critical)
- ✅ CV upload works for PDF and DOCX files
- ✅ All 5 processing stages complete successfully
- ✅ Results page displays all data correctly
- ✅ Real-time SSE progress updates work
- ✅ No unhandled errors or crashes

### Should Pass (Important)
- ✅ PDF export works
- ✅ Job comparison feature works
- ✅ Rate limiting enforced
- ✅ Error messages are clear and helpful

### Nice to Have (Enhancement)
- ✅ Mobile responsive
- ✅ Fast load times (< 3s)
- ✅ Professional UI/UX

---

## Test Execution Checklist

- [ ] Docker containers running (PostgreSQL, Redis)
- [ ] Database migrations applied
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Browser devtools open for monitoring
- [ ] Sample CV files ready
- [ ] Sample job descriptions ready

---

## Automated Test Script

```bash
#!/bin/bash
# quick-test.sh - Quick smoke test for CV Analyzer

echo "🧪 CV Analyzer - Quick Smoke Test"
echo "=================================="

# 1. Check services
echo "📡 Checking services..."
curl -s http://localhost:8000/health || echo "❌ Backend not responding"
curl -s -I http://localhost:3000 | head -1 || echo "❌ Frontend not responding"

# 2. Check database
echo "💾 Checking database..."
docker exec cv-analyzer-postgres pg_isready -U postgres || echo "❌ Database not ready"

# 3. Check API endpoints
echo "🔌 Checking API..."
curl -s http://localhost:8000/api/v1/health | jq .

# 4. Test upload endpoint (health check only)
echo "📤 Testing upload endpoint..."
curl -s -X POST http://localhost:8000/api/v1/upload -F "file=@test-cv.pdf" || echo "Upload endpoint exists"

echo "✅ Smoke test complete!"
```

---

## Reporting Template

### Test Execution Summary
- **Date:** [Fill in]
- **Tester:** [Fill in]
- **Environment:** [Development/Production]
- **Browser:** [Chrome/Firefox/Safari]
- **Results:** [Pass/Fail/Partial]

### Issues Found
| # | Severity | Description | Steps to Reproduce |
|---|----------|-------------|-------------------|
| 1 | | | |

### Screenshots
[Attach screenshots for each scenario]

### Overall Assessment
[✅ Pass / ❌ Fail / ⚠️ Partial]

---

## Next Steps

After manual testing:
1. Fix any critical issues found
2. Update test cases based on findings
3. Add automated tests for common scenarios
4. Document any UX improvements needed

---

*Test Plan created: 2026-04-08*
*For automated execution or manual testing*
