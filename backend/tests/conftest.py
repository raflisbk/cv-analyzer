"""
Shared pytest fixtures for Phase 2 tests.
All fixtures use mocks/fakes — no real spaCy model, no real OpenAI calls, no DB.
"""

from unittest.mock import MagicMock, patch

import pytest


SAMPLE_CV_TEXT = """
John Doe
john.doe@email.com | linkedin.com/in/johndoe | +1-555-0100

SUMMARY
Results-driven software engineer with 5+ years experience building
distributed systems and REST APIs.

EXPERIENCE
Senior Software Engineer, Acme Corp - 2021-Present
- Led migration of monolithic app to microservices, reducing latency by 40%
- Built real-time data pipeline processing 1M events/day using Apache Kafka

Software Engineer, StartupXYZ - 2019-2021
- Developed FastAPI backend serving 50K daily active users
- Implemented CI/CD pipeline cutting deployment time from 2h to 15 minutes

EDUCATION
Bachelor of Science, Computer Science
State University - 2015-2019, GPA: 3.8

SKILLS
Python, FastAPI, Docker, PostgreSQL, Redis, Celery, Apache Kafka,
React, TypeScript, Kubernetes, AWS, Git
"""


@pytest.fixture
def sample_cv_text() -> str:
    """Sample CV text for unit tests"""
    return SAMPLE_CV_TEXT.strip()


@pytest.fixture
def mock_nlp():
    """Mock spaCy nlp object — avoids loading 750MB model in unit tests"""
    with patch("app.services.nlp.model.get_nlp") as mock_get_nlp:
        mock_doc = MagicMock()
        mock_doc.ents = []
        mock_doc.noun_chunks = []
        mock_nlp_instance = MagicMock()
        mock_nlp_instance.return_value = mock_doc
        mock_get_nlp.return_value = mock_nlp_instance
        yield mock_get_nlp


@pytest.fixture
def mock_openai_embedding():
    """Mock OpenAI embeddings — returns deterministic fake embedding"""
    fake_embedding = [0.1] * 1536  # text-embedding-3-small dimension

    with patch("app.services.scoring.embeddings.get_embedding") as mock_embed:
        mock_embed.return_value = fake_embedding
        yield mock_embed


@pytest.fixture
def mock_language_tool():
    """Mock LanguageTool — avoids starting Java server in tests"""
    with patch("app.services.grammar.checker.get_tool") as mock_get_tool:
        mock_tool = MagicMock()
        mock_tool.check.return_value = []
        mock_get_tool.return_value = mock_tool
        yield mock_get_tool
