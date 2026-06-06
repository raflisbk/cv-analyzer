"""Skills gap analysis: rank missing skills by priority and add learning resources.

Priority levels: high, medium, low
Resources are curated static links — no LLM hallucination.
"""

from dataclasses import dataclass, field


@dataclass
class SkillInfo:
    priority: str  # "high" | "medium" | "low"
    category: str
    why_important: str
    resources: list[dict[str, str]] = field(default_factory=list)


_SKILL_REGISTRY: dict[str, SkillInfo] = {
    # ── Python / General ──────────────────────────────────────────────────
    "python": SkillInfo(
        priority="high",
        category="Programming",
        why_important="Primary language for ML/data roles. Required in virtually every JD.",
        resources=[
            {"title": "Python for Everybody (Coursera)", "url": "https://www.coursera.org/specializations/python"},
        ],
    ),
    "sql": SkillInfo(
        priority="high",
        category="Data",
        why_important="Essential for querying, transforming, and validating data in any data role.",
        resources=[
            {"title": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/"},
        ],
    ),
    # ── ML Frameworks ─────────────────────────────────────────────────────
    "pytorch": SkillInfo(
        priority="high",
        category="ML Framework",
        why_important="Industry-standard deep learning framework. Dominates research and production.",
        resources=[
            {"title": "PyTorch Official Tutorials", "url": "https://pytorch.org/tutorials/"},
        ],
    ),
    "tensorflow": SkillInfo(
        priority="medium",
        category="ML Framework",
        why_important="Widely used in enterprise ML deployments and mobile inference.",
        resources=[
            {"title": "TensorFlow Learn", "url": "https://www.tensorflow.org/learn"},
        ],
    ),
    "scikit-learn": SkillInfo(
        priority="high",
        category="ML Framework",
        why_important="Standard toolkit for classical ML (classification, regression, clustering).",
        resources=[
            {"title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html"},
        ],
    ),
    "huggingface": SkillInfo(
        priority="high",
        category="NLP / LLM",
        why_important="Go-to library for transformer models and LLM fine-tuning.",
        resources=[
            {"title": "HuggingFace Course", "url": "https://huggingface.co/learn/nlp-course"},
        ],
    ),
    # ── MLOps ────────────────────────────────────────────────────────────
    "docker": SkillInfo(
        priority="high",
        category="MLOps",
        why_important="Required for reproducible model environments and deployment.",
        resources=[
            {"title": "Docker Get Started", "url": "https://docs.docker.com/get-started/"},
        ],
    ),
    "kubernetes": SkillInfo(
        priority="medium",
        category="MLOps",
        why_important="Standard for scaling ML services in production cloud environments.",
        resources=[
            {"title": "Kubernetes Basics (kubernetes.io)", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"},
        ],
    ),
    "mlflow": SkillInfo(
        priority="medium",
        category="MLOps",
        why_important="Most common experiment tracking and model registry tool.",
        resources=[
            {"title": "MLflow Quickstart", "url": "https://mlflow.org/docs/latest/quickstart.html"},
        ],
    ),
    "github actions": SkillInfo(
        priority="medium",
        category="CI/CD",
        why_important="Automates testing and deployment pipelines for ML and software projects.",
        resources=[
            {"title": "GitHub Actions Docs", "url": "https://docs.github.com/en/actions"},
        ],
    ),
    # ── Cloud ─────────────────────────────────────────────────────────────
    "aws": SkillInfo(
        priority="medium",
        category="Cloud",
        why_important="Largest cloud platform. SageMaker, S3, EC2 are common in ML JDs.",
        resources=[
            {"title": "AWS Machine Learning Path", "url": "https://aws.amazon.com/training/learn-about/machine-learning/"},
        ],
    ),
    "gcp": SkillInfo(
        priority="medium",
        category="Cloud",
        why_important="Google Cloud Vertex AI is popular for ML workloads.",
        resources=[
            {"title": "Google Cloud ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course"},
        ],
    ),
    # ── LLM / GenAI ───────────────────────────────────────────────────────
    "langchain": SkillInfo(
        priority="high",
        category="GenAI",
        why_important="Dominant framework for building LLM applications and RAG pipelines.",
        resources=[
            {"title": "LangChain Docs", "url": "https://python.langchain.com/docs/get_started/introduction"},
        ],
    ),
    "rag": SkillInfo(
        priority="high",
        category="GenAI",
        why_important="Retrieval-Augmented Generation is required for most LLM production systems.",
        resources=[
            {"title": "LlamaIndex RAG Guide", "url": "https://docs.llamaindex.ai/en/stable/"},
        ],
    ),
    # ── Data Engineering ──────────────────────────────────────────────────
    "apache spark": SkillInfo(
        priority="high",
        category="Data Engineering",
        why_important="Industry standard for large-scale distributed data processing.",
        resources=[
            {"title": "Spark by Example", "url": "https://sparkbyexamples.com/"},
        ],
    ),
    "airflow": SkillInfo(
        priority="medium",
        category="Data Engineering",
        why_important="Most common workflow orchestration tool for data pipelines.",
        resources=[
            {"title": "Airflow Tutorial", "url": "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html"},
        ],
    ),
    "kafka": SkillInfo(
        priority="medium",
        category="Data Engineering",
        why_important="Standard for real-time event streaming architectures.",
        resources=[
            {"title": "Kafka Quickstart", "url": "https://kafka.apache.org/quickstart"},
        ],
    ),
    "dbt": SkillInfo(
        priority="medium",
        category="Data Engineering",
        why_important="Widely adopted for data transformation and analytics engineering.",
        resources=[
            {"title": "dbt Learn", "url": "https://learn.getdbt.com/"},
        ],
    ),
    # ── Computer Vision ───────────────────────────────────────────────────
    "opencv": SkillInfo(
        priority="medium",
        category="Computer Vision",
        why_important="Standard library for image processing tasks.",
        resources=[
            {"title": "OpenCV Python Tutorials", "url": "https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html"},
        ],
    ),
    "yolo": SkillInfo(
        priority="medium",
        category="Computer Vision",
        why_important="Dominant real-time object detection framework.",
        resources=[
            {"title": "Ultralytics YOLOv8 Docs", "url": "https://docs.ultralytics.com/"},
        ],
    ),
}


def rank_skill_gaps(missing_skills: list[str]) -> list[dict]:
    """Return missing skills ranked high→medium→low with metadata.

    Skills not in the registry are returned with priority='low' and no resources.
    """
    priority_order = {"high": 0, "medium": 1, "low": 2}
    enriched: list[dict] = []

    for skill in missing_skills:
        key = skill.lower().strip()
        info = _SKILL_REGISTRY.get(key)
        if info:
            enriched.append({
                "skill": skill,
                "priority": info.priority,
                "category": info.category,
                "why_important": info.why_important,
                "resources": info.resources,
            })
        else:
            enriched.append({
                "skill": skill,
                "priority": "low",
                "category": "General",
                "why_important": f"Listed as required in the target job description.",
                "resources": [],
            })

    enriched.sort(key=lambda x: (priority_order.get(x["priority"], 2), x["skill"].lower()))
    return enriched
