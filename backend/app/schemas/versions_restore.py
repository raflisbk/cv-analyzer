from app.schemas.report_detail import ReportModel


class RestoredVersion(ReportModel):
    job_id: str
    version: str
