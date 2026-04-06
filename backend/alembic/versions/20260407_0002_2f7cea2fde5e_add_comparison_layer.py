"""Add comparison layer: job_roles table, comparison columns on jobs, COMPARING enum.

Revision ID: 2f7cea2fde5e
Revises: bc028a15129a
Create Date: 2026-04-07 00:02:35.061126

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "2f7cea2fde5e"
down_revision: Union[str, None] = "bc028a15129a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create job_roles lookup table per D-C3
    op.create_table(
        "job_roles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("seniority", sa.String(20), nullable=False),  # junior | mid | senior
        sa.Column("industry", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("requirements", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "seniority IN ('junior', 'mid', 'senior')",
            name="ck_job_roles_seniority",
        ),
    )

    # 2. Add COMPARING to jobstatus enum (PostgreSQL 13+ — cannot be rolled back)
    op.execute(
        sa.text("ALTER TYPE jobstatus ADD VALUE IF NOT EXISTS 'COMPARING' BEFORE 'COMPLETE'")
    )

    # 3. Add 4 comparison columns to jobs table per D-C9
    op.add_column("jobs", sa.Column("comparison_result", postgresql.JSONB(), nullable=True))
    op.add_column("jobs", sa.Column("comparison_status", sa.String(20), nullable=True))
    op.add_column("jobs", sa.Column("jd_text", sa.Text(), nullable=True))
    op.add_column(
        "jobs",
        sa.Column("jd_role_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_jobs_jd_role_id", "jobs", "job_roles", ["jd_role_id"], ["id"]
    )

    # 4. Seed ~20 job roles per D-C4 (Alembic data migration, not seed script)
    # Uses gen_random_uuid() (PostgreSQL 13+ built-in) — no Python uuid generation needed
    op.execute(
        sa.text("""
            INSERT INTO job_roles (id, title, seniority, industry, description, requirements)
            VALUES
            (gen_random_uuid(), 'Backend Software Engineer', 'mid', 'Technology',
             'Design and build scalable backend services and REST APIs.',
             'Python, FastAPI, PostgreSQL, Redis, Docker, REST API design'),
            (gen_random_uuid(), 'Backend Software Engineer', 'senior', 'Technology',
             'Lead backend architecture and mentor junior engineers.',
             'Python, system design, microservices, PostgreSQL, Redis, Docker, AWS'),
            (gen_random_uuid(), 'Frontend Engineer', 'mid', 'Technology',
             'Build responsive, accessible web interfaces.',
             'React, TypeScript, Next.js, CSS, Tailwind CSS, REST APIs'),
            (gen_random_uuid(), 'Full-Stack Engineer', 'mid', 'Technology',
             'Develop end-to-end features across frontend and backend stacks.',
             'React, TypeScript, Node.js, Python, PostgreSQL, Docker'),
            (gen_random_uuid(), 'Machine Learning Engineer', 'mid', 'Technology',
             'Build and deploy ML models in production.',
             'Python, PyTorch, scikit-learn, MLflow, Docker, SQL'),
            (gen_random_uuid(), 'Machine Learning Engineer', 'senior', 'Technology',
             'Architect ML platforms and lead model development.',
             'Python, PyTorch, TensorFlow, Kubernetes, MLOps, system design'),
            (gen_random_uuid(), 'Data Scientist', 'mid', 'Technology',
             'Analyze data and build predictive models.',
             'Python, pandas, scikit-learn, SQL, Jupyter, statistics'),
            (gen_random_uuid(), 'Data Engineer', 'mid', 'Technology',
             'Design and maintain data pipelines and warehouses.',
             'Python, Spark, Airflow, SQL, dbt, Snowflake, Kafka'),
            (gen_random_uuid(), 'DevOps/Platform Engineer', 'mid', 'Technology',
             'Build CI/CD pipelines and manage cloud infrastructure.',
             'Kubernetes, Docker, Terraform, AWS, GitHub Actions, Linux'),
            (gen_random_uuid(), 'AI Engineer', 'mid', 'Technology',
             'Integrate LLMs and AI capabilities into production systems.',
             'Python, OpenAI API, LangChain, FastAPI, PostgreSQL, pgvector, RAG'),
            (gen_random_uuid(), 'AI Engineer', 'senior', 'Technology',
             'Lead AI product strategy and architect LLM-based systems.',
             'Python, OpenAI API, LangChain, RAG architecture, system design, team leadership'),
            (gen_random_uuid(), 'Product Manager', 'mid', 'Business',
             'Define product strategy and work with engineering teams.',
             'Product roadmap, user research, stakeholder management, Agile, Jira'),
            (gen_random_uuid(), 'Product Manager', 'senior', 'Business',
             'Own product vision and drive cross-functional alignment.',
             'Strategic planning, OKRs, P&L, leadership, market analysis, Agile'),
            (gen_random_uuid(), 'UX Designer', 'mid', 'Design',
             'Create user-centered designs and interaction patterns.',
             'Figma, user research, wireframing, prototyping, usability testing'),
            (gen_random_uuid(), 'Data Analyst', 'junior', 'Business',
             'Analyze business data and create dashboards.',
             'SQL, Python, Excel, Tableau, data visualization'),
            (gen_random_uuid(), 'Data Analyst', 'mid', 'Business',
             'Drive data-informed decisions through analysis.',
             'SQL, Python, Tableau, statistics, A/B testing, stakeholder communication'),
            (gen_random_uuid(), 'Marketing Manager', 'mid', 'Business',
             'Plan and execute digital marketing campaigns.',
             'SEO, SEM, Google Analytics, content marketing, CRM, budget management'),
            (gen_random_uuid(), 'Cloud Solutions Architect', 'senior', 'Technology',
             'Design and govern cloud architecture across AWS/GCP.',
             'AWS, GCP, Terraform, microservices, security, cost optimization'),
            (gen_random_uuid(), 'Backend Software Engineer', 'junior', 'Technology',
             'Build and maintain backend APIs under supervision.',
             'Python, REST APIs, SQL, Git, debugging, unit testing'),
            (gen_random_uuid(), 'Frontend Engineer', 'junior', 'Technology',
             'Implement UI components from design specs.',
             'React, JavaScript, CSS, HTML, Git, responsive design')
        """)
    )


def downgrade() -> None:
    # Drop FK + columns + table
    # Note: Cannot remove COMPARING from PostgreSQL enum — this is intentional
    op.drop_constraint("fk_jobs_jd_role_id", "jobs", type_="foreignkey")
    op.drop_column("jobs", "jd_role_id")
    op.drop_column("jobs", "jd_text")
    op.drop_column("jobs", "comparison_status")
    op.drop_column("jobs", "comparison_result")
    op.drop_table("job_roles")
