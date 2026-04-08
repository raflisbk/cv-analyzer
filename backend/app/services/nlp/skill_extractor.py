"""
Skill extraction service per D-03 and NLP-04.
Uses spaCy noun chunks + curated tech/professional skills whitelist.
ESCO taxonomy removed: it covers all job competencies (not just tech skills),
producing false positives like 'perform eye surgery' from CV action phrases.
"""

from app.core.logging import structured_logger as logger
from app.services.nlp.model import get_nlp


# Curated tech & professional skills whitelist (single and multi-word).
# Covers languages, frameworks, tools, cloud, data, methodologies.
_SKILLS_WHITELIST: dict[str, str] = {
    # ── Programming languages ──────────────────────────────────────────────
    "python": "Python",
    "java": "Java",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "ruby": "Ruby",
    "scala": "Scala",
    "php": "PHP",
    "perl": "Perl",
    "r": "R",
    "matlab": "MATLAB",
    "c": "C",
    "c++": "C++",
    "c#": "C#",
    "dart": "Dart",
    "elixir": "Elixir",
    "haskell": "Haskell",
    "lua": "Lua",
    "groovy": "Groovy",
    "bash": "Bash",
    "shell": "Shell",
    "powershell": "PowerShell",
    "cobol": "COBOL",
    "fortran": "Fortran",
    # ── Web / Frontend ──────────────────────────────────────────────────────
    "react": "React",
    "angular": "Angular",
    "vue": "Vue.js",
    "svelte": "Svelte",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "nuxtjs": "Nuxt.js",
    "remix": "Remix",
    "gatsby": "Gatsby",
    "html": "HTML",
    "css": "CSS",
    "sass": "SASS",
    "scss": "SCSS",
    "tailwind": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "webpack": "Webpack",
    "vite": "Vite",
    "babel": "Babel",
    "jquery": "jQuery",
    "redux": "Redux",
    "graphql": "GraphQL",
    # ── Backend frameworks ──────────────────────────────────────────────────
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "express": "Express.js",
    "nestjs": "NestJS",
    "fastify": "Fastify",
    "spring": "Spring",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "rails": "Ruby on Rails",
    "laravel": "Laravel",
    "symfony": "Symfony",
    "gin": "Gin",
    "fiber": "Fiber",
    "actix": "Actix",
    # ── Databases ───────────────────────────────────────────────────────────
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "mariadb": "MariaDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    "firestore": "Firestore",
    "sqlite": "SQLite",
    "oracle": "Oracle DB",
    "mssql": "SQL Server",
    "sql server": "SQL Server",
    "neo4j": "Neo4j",
    "influxdb": "InfluxDB",
    "sql": "SQL",
    "nosql": "NoSQL",
    # ── Cloud & DevOps ──────────────────────────────────────────────────────
    "aws": "AWS",
    "gcp": "GCP",
    "azure": "Azure",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "helm": "Helm",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "gitlab": "GitLab",
    "circleci": "CircleCI",
    "travis": "Travis CI",
    "nginx": "Nginx",
    "apache": "Apache",
    "linux": "Linux",
    "unix": "Unix",
    "ubuntu": "Ubuntu",
    "git": "Git",
    "github": "GitHub",
    "bitbucket": "Bitbucket",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    # ── Data / ML / AI ──────────────────────────────────────────────────────
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scipy": "SciPy",
    "matplotlib": "Matplotlib",
    "seaborn": "Seaborn",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "keras": "Keras",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "xgboost": "XGBoost",
    "lightgbm": "LightGBM",
    "huggingface": "Hugging Face",
    "langchain": "LangChain",
    "spark": "Apache Spark",
    "hadoop": "Hadoop",
    "kafka": "Kafka",
    "airflow": "Apache Airflow",
    "dbt": "dbt",
    "tableau": "Tableau",
    "powerbi": "Power BI",
    "power bi": "Power BI",
    "looker": "Looker",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "natural language processing": "NLP",
    "nlp": "NLP",
    "computer vision": "Computer Vision",
    "data engineering": "Data Engineering",
    "data science": "Data Science",
    # ── APIs & architecture ──────────────────────────────────────────────────
    "rest": "REST API",
    "restful": "REST API",
    "rest api": "REST API",
    "grpc": "gRPC",
    "websocket": "WebSocket",
    "microservices": "Microservices",
    "event driven": "Event-Driven Architecture",
    "message queue": "Message Queue",
    # ── Methods & practices ─────────────────────────────────────────────────
    "agile": "Agile",
    "scrum": "Scrum",
    "kanban": "Kanban",
    "devops": "DevOps",
    "mlops": "MLOps",
    "devsecops": "DevSecOps",
    "tdd": "TDD",
    "bdd": "BDD",
    "ddd": "Domain-Driven Design",
    "clean architecture": "Clean Architecture",
    "system design": "System Design",
    "object oriented": "OOP",
    "oop": "OOP",
    "functional programming": "Functional Programming",
    # ── Tools ───────────────────────────────────────────────────────────────
    "jira": "Jira",
    "confluence": "Confluence",
    "notion": "Notion",
    "figma": "Figma",
    "postman": "Postman",
    "swagger": "Swagger",
    "openapi": "OpenAPI",
    "celery": "Celery",
    "rabbitmq": "RabbitMQ",
    "prometheus": "Prometheus",
    "grafana": "Grafana",
    "sentry": "Sentry",
    "datadog": "Datadog",
}

# Build lowercase lookup set for fast single-token matching
_WHITELIST_LOWER: dict[str, str] = {k.lower(): v for k, v in _SKILLS_WHITELIST.items()}

# Longest phrase length in whitelist (for n-gram window)
_MAX_NGRAM = max(len(k.split()) for k in _SKILLS_WHITELIST)


def extract_skills(text: str, score_cutoff: int = 85) -> list[str]:  # noqa: ARG001
    """
    Extract skills from CV text using curated whitelist matching.

    Strategy:
    1. Scan sliding n-gram windows (1 to max phrase length) over the token stream
    2. Exact match (case-insensitive) against the curated whitelist
    3. Prefer longer phrase matches (e.g. 'Spring Boot' over 'Spring')
    4. Deduplicate and return sorted canonical display names

    Args:
        text: CV text to analyze
        score_cutoff: Unused — kept for API compatibility. Whitelist uses exact matching.

    Returns:
        Sorted list of matched skill display names.
    """
    nlp = get_nlp()
    doc = nlp(text)

    tokens = [token.text for token in doc if not token.is_space]
    matched: set[str] = set()
    covered: set[int] = set()  # token indices already claimed by a longer match

    # Scan longest-first to prefer "Spring Boot" over "Spring"
    for ngram_len in range(_MAX_NGRAM, 0, -1):
        for i in range(len(tokens) - ngram_len + 1):
            # Skip if any token in this window already claimed by longer match
            if any(j in covered for j in range(i, i + ngram_len)):
                continue
            phrase = " ".join(tokens[i : i + ngram_len]).lower().strip(".,;:()")
            if phrase in _WHITELIST_LOWER:
                matched.add(_WHITELIST_LOWER[phrase])
                for j in range(i, i + ngram_len):
                    covered.add(j)

    logger.info("Skill extraction complete", extra={"count": len(matched)})
    return sorted(matched)
