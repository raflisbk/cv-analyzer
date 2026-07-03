$root = $PSScriptRoot

function Encode-Cmd([string]$cmd) {
    [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($cmd))
}

$be = Encode-Cmd "conda activate sbk-cv-analyzer; Set-Location '$root\backend'; uvicorn app.main:app --reload --port 8000"
$ce = Encode-Cmd "conda activate sbk-cv-analyzer; Set-Location '$root\backend'; celery -A app.tasks.celery_app worker --loglevel=info --pool=solo"
$fe = Encode-Cmd "Set-Location '$root\frontend'; npm run dev"

$wtCmd = "wt new-tab --title Backend -- pwsh -NoExit -EncodedCommand $be ; new-tab --title Celery -- pwsh -NoExit -EncodedCommand $ce ; new-tab --title Frontend -- pwsh -NoExit -EncodedCommand $fe"
cmd /c $wtCmd
