# Start Backend Server
$env:CV_ANALYZER_DB_PASSWORD="postgres"
cd "D:\Subek\project\Draft\SBK\cv-analyzer\backend"
conda activate sbk-cv-analyzer
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
