import re
import uuid
from pathlib import Path

from app.services.app_lists.cv_summaries import cv_summaries
from app.services.app_lists.report_aggregate import report_aggregate
from app.services.app_lists.report_summaries import report_summaries
from app.services.report_detail.assemble import report_detail
from app.services.versions_view.chain import versions
from app.services.workspace_data.ats_view import ats_data
from app.services.workspace_data.grammar_view import grammar_data
from scripts.seed_demo.builders import build_jobs

ROOT = Path(__file__).resolve().parents[2] / "frontend/lib/app-api"
INTERFACES = {
    "CvSummary": (
        "cvs.types.ts",
        "jobId fileName targetRole score status updatedAt pages wordCount",
    ),
    "ReportSummary": (
        "reports.types.ts",
        "jobId fileName role analyzedAt score dimensions versions topFix fileFacts",
    ),
    "ReportsData": ("reports.types.ts", "reports aggregate"),
    "ReportDetail": (
        "report-detail.types.ts",
        "fileName role version score previousScore projectedScore verdict topPercent facts fixes dimensions sections bullets grammar keywords ats versions",
    ),
    "VersionData": ("history.types.ts", "id label at score delta summary current"),
    "AtsData": (
        "ats.types.ts",
        "score summary compat parsed plainText checks hiddenText",
    ),
    "GrammarData": ("grammar.types.ts", "stats notes"),
}
NESTED = {
    "ReportSummary.dimensions": "impact clarity relevance completeness",
    "ReportSummary.versions.0": "label score at",
    "ReportSummary.fileFacts": "type pages sizeKb bullets",
    "ReportsData.aggregate": "count bestScore averageImpact lastAnalysisAt openFixes recurringFixes averageByDimension",
    "ReportsData.aggregate.recurringFixes.0": "dimension cvCount text",
    "ReportsData.aggregate.averageByDimension": "impact clarity relevance completeness",
    "ReportDetail.verdict": "title body",
    "ReportDetail.fixes.0": "title text points",
    "ReportDetail.dimensions.0": "key score previous projected description metrics hint evidence",
    "ReportDetail.dimensions.0.metrics.0": "label value percent",
    "ReportDetail.dimensions.0.evidence.0": "text note positive",
    "ReportDetail.sections.0": "name score note",
    "ReportDetail.bullets.0": "text source strength tags",
    "ReportDetail.grammar": "spelling grammar style notes",
    "ReportDetail.grammar.notes.0": "before after location",
    "ReportDetail.keywords": "present missing total",
    "ReportDetail.keywords.present.0": "name count",
    "ReportDetail.ats": "score facts checks",
    "ReportDetail.ats.checks.0": "text ok",
    "ReportDetail.versions.0": "label score at summary",
    "AtsData.compat.0": "system rating",
    "AtsData.parsed.0": "field value confidence",
    "AtsData.plainText": "lines note",
    "AtsData.plainText.lines.0": "text flagged",
    "AtsData.checks.0": "group label status",
    "AtsData.hiddenText": "found items",
    "GrammarData.stats": "readingGrade wordsPerSentence passiveLines tone",
    "GrammarData.notes.0": "id type location before after",
}


def typescript_fields(file_name: str, interface: str) -> set[str]:
    source = (ROOT / file_name).read_text()
    start = source.index(f"export interface {interface} {{")
    depth = 0
    fields = set()
    for line in source[start:].splitlines():
        if depth == 1:
            match = re.match(r"\s+([A-Za-z][A-Za-z0-9]*):", line)
            if match:
                fields.add(match[1])
        depth += line.count("{") - line.count("}")
        if depth == 0:
            break
    return fields


def at_path(payload: dict, path: str):
    value = payload
    for part in path.split("."):
        value = value[int(part)] if part.isdigit() else value[part]
    return value


def test_seed_payload_keys_match_frontend_interfaces():
    jobs = build_jobs(uuid.uuid4(), "demo@example.test")
    by_id = {job.id: job for job in jobs}
    reports = report_summaries(jobs)
    payloads = {
        "CvSummary": cv_summaries(jobs)[0].model_dump(by_alias=True),
        "ReportSummary": reports[0].model_dump(by_alias=True),
        "ReportsData": {
            "reports": [report.model_dump(by_alias=True) for report in reports],
            "aggregate": report_aggregate(reports, jobs).model_dump(by_alias=True),
        },
        "ReportDetail": report_detail(jobs[2], by_id).model_dump(by_alias=True),
        "VersionData": versions(jobs[2], by_id)[0].model_dump(by_alias=True),
        "AtsData": ats_data(jobs[2]).model_dump(by_alias=True),
        "GrammarData": grammar_data(jobs[2]).model_dump(by_alias=True),
    }
    for name, (file_name, keys) in INTERFACES.items():
        expected = set(keys.split())
        assert typescript_fields(file_name, name) == expected, name
        assert set(payloads[name]) == expected, name
    for path, keys in NESTED.items():
        name, nested = path.split(".", 1)
        assert set(at_path(payloads[name], nested)) == set(keys.split()), path
