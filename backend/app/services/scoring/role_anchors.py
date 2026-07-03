"""Per-role anchor overrides for the 4 scoring dimensions.

Each key is a role slug (matches what the frontend sends and what's stored in
job.target_role).  Values are dicts with keys matching _DIMENSION_CONFIGS names:
clarity, impact, completeness, relevance.  Any missing key falls back to the
generic anchors in anchors.py.
"""

ROLE_ANCHORS: dict[str, dict[str, list[str]]] = {
    "ml_engineer": {
        "clarity": [
            (
                "Junior Machine Learning Engineer with 1+ year building production-ready AI systems. "
                "Designed and deployed computer vision pipelines for real-time object detection. "
                "Documented model architecture, training procedures, and evaluation metrics clearly. "
                "Communicated experiment results to stakeholders through structured reports."
            ),
            (
                "AI Engineer experienced in NLP, computer vision, and generative AI. "
                "Built end-to-end ML pipelines from data ingestion to model serving. "
                "Wrote clear technical documentation for model cards and API usage guides. "
                "Explained complex model behaviour and tradeoffs to non-technical audiences."
            ),
            (
                "EXPERIENCE\nML Engineer, StartupAI (Jan 2023-Present)\n"
                "- Developed object detection model using YOLOv8 achieving 91% mAP on production dataset\n"
                "- Built FastAPI inference service handling 200 req/s with <100ms latency\n"
                "- Automated training pipeline with MLflow experiment tracking\n\n"
                "EDUCATION\nS1 Teknik Informatika, Universitas Indonesia (2023)\nIPK: 3.7"
            ),
            (
                "SKILLS\nAI/ML: Python, TensorFlow, PyTorch, scikit-learn, HuggingFace\n"
                "MLOps: MLflow, Docker, GitHub Actions, GCP Vertex AI\n"
                "Data: pandas, NumPy, SQL, BigQuery\n"
                "Deployment: FastAPI, Celery, Redis, PostgreSQL"
            ),
        ],
        "impact": [
            (
                "Trained object detection model achieving 91% mAP, improving over 78% baseline (+13%). "
                "Optimised inference pipeline reducing latency from 850ms to 95ms (89% faster). "
                "Deployed ML service handling 10K daily requests with 99.5% uptime. "
                "Reduced manual labelling time by 70% through active learning data selection."
            ),
            (
                "Built NLP text classification model reaching 94% F1-score on production dataset. "
                "Reduced model training time by 60% through mixed-precision training and data caching. "
                "Shipped RAG-based chatbot serving 500+ internal users with <2s response time. "
                "Cut cloud compute cost by 40% by switching to quantised model inference."
            ),
            (
                "Delivered computer vision quality-inspection system replacing manual checking for 3 production lines. "
                "Achieved defect detection recall of 97% with <0.5% false positive rate. "
                "Processed 1,200 units/hour, 3× faster than previous manual inspection. "
                "Saved estimated Rp 150M/year in labour and defect rework costs."
            ),
            (
                "Completed 2 production ML features during 3-month internship shipped to 10K users. "
                "Improved recommendation click-through rate by 8% through feature engineering. "
                "Reduced data preprocessing pipeline runtime by 45% using vectorised pandas operations. "
                "Contributed 5 merged pull requests with 100% test coverage."
            ),
        ],
        "completeness": [
            (
                "CONTACT\nName | email | phone | LinkedIn | GitHub: github.com/username | Portfolio\n\n"
                "SUMMARY\nJunior ML Engineer with 1+ year production experience in computer vision and NLP.\n\n"
                "EXPERIENCE\n2 roles with dates, tech stack used, model metrics, and business impact.\n\n"
                "PROJECTS\n3 projects with: name, GitHub link, tech stack, dataset size, evaluation metric.\n\n"
                "EDUCATION\nS1 Computer Science / Informatics, GPA 3.5+\n\n"
                "SKILLS\nGrouped: Languages, ML Frameworks, MLOps, Cloud, Databases.\n\n"
                "CERTIFICATIONS\nTensorFlow Developer Certificate | Google Cloud Professional ML Engineer"
            ),
            (
                "Complete ML engineer CV with: public GitHub profile with pinned repositories, "
                "Kaggle profile or competition rankings, portfolio website or demo links, "
                "projects section listing model architecture and performance metrics, "
                "skills grouped as programming languages, ML frameworks, deployment tools, "
                "cloud platforms, and databases with proficiency indicators."
            ),
        ],
        "relevance": [
            (
                "Machine learning engineer with expertise in deep learning, computer vision, "
                "natural language processing, PyTorch, TensorFlow, Keras, scikit-learn, "
                "HuggingFace Transformers, YOLO, OpenCV, CNNs, object detection, "
                "image segmentation, model training, hyperparameter tuning, transfer learning."
            ),
            (
                "AI engineer specialising in generative AI, large language models, RAG pipelines, "
                "LangChain, LlamaIndex, vector databases, pgvector, Chroma, Pinecone, "
                "prompt engineering, fine-tuning, LoRA, RLHF, OpenAI API, "
                "inference optimisation, quantisation, ONNX, TensorRT."
            ),
            (
                "MLOps / AI infrastructure engineer skilled in model deployment, "
                "Docker, Kubernetes, FastAPI, Celery, Redis, MLflow, DVC, "
                "CI/CD pipelines, GitHub Actions, Google Cloud Platform, AWS SageMaker, "
                "model monitoring, data drift detection, A/B testing for ML models."
            ),
        ],
    },
    "data_scientist": {
        "clarity": [
            (
                "Data scientist with strong analytical and communication skills. "
                "Translated complex statistical findings into actionable business insights. "
                "Presented model results to product and executive stakeholders using clear visuals. "
                "Documented analysis methodology, assumptions, and limitations thoroughly."
            ),
            (
                "EXPERIENCE\nData Scientist, FinTech Corp (2022-Present)\n"
                "- Built churn prediction model (AUC 0.91) deployed to production CRM\n"
                "- Designed A/B testing framework adopted by growth team for all experiments\n"
                "- Presented weekly analytics dashboard to C-level with 5-minute executive summaries\n\n"
                "EDUCATION\nS2 Statistika, IPB University (2022)\nIPK: 3.8"
            ),
        ],
        "impact": [
            (
                "Built customer churn prediction model (91% AUC) reducing churn by 18% ($2M ARR saved). "
                "Designed recommendation engine increasing average order value by 22%. "
                "Automated reporting pipeline saving 15 analyst-hours/week. "
                "Improved forecast accuracy by 35% using ensemble time-series models."
            ),
            (
                "Conducted A/B tests across 12 product features generating 3 statistically significant wins. "
                "Built fraud detection model reducing false positives by 40% while maintaining 99% recall. "
                "Reduced model inference cost by 50% via feature selection and lighter architecture. "
                "Delivered segmentation analysis informing $500K marketing budget allocation."
            ),
        ],
        "completeness": [
            (
                "CONTACT\nName | email | LinkedIn | GitHub | Kaggle profile\n\n"
                "SUMMARY\nData Scientist with 3+ years in retail/fintech analytics and ML modelling.\n\n"
                "EXPERIENCE\n2+ roles with: business problem, methodology, metrics, and business impact.\n\n"
                "PROJECTS\nPersonal Kaggle competitions (rankings), open-source notebooks, analysis posts.\n\n"
                "EDUCATION\nDegree in Statistics, Math, CS, or Engineering.\n\n"
                "SKILLS\nStatistics, Python/R, SQL, ML frameworks, visualisation tools, cloud platforms.\n\n"
                "PUBLICATIONS/TALKS\nBlogs, conference talks, internal tech sharing sessions."
            ),
        ],
        "relevance": [
            (
                "Data scientist with skills in statistical modelling, exploratory data analysis, "
                "pandas, NumPy, matplotlib, seaborn, Plotly, SQL, BigQuery, "
                "A/B testing, hypothesis testing, regression, classification, clustering, "
                "time series forecasting, feature engineering, cross-validation."
            ),
            (
                "Data scientist experienced in machine learning pipelines, scikit-learn, XGBoost, LightGBM, "
                "Spark MLlib, deep learning with TensorFlow or PyTorch, "
                "experiment tracking with MLflow or Weights & Biases, "
                "data storytelling, dashboards with Tableau or Metabase."
            ),
        ],
    },
    "software_engineer": {
        "clarity": [
            (
                "Results-driven software engineer with 5+ years of experience building "
                "distributed systems. Clear communication demonstrated through leading "
                "cross-functional teams and technical documentation. Proven track record of "
                "delivering projects on time with measurable outcomes."
            ),
            (
                "EXPERIENCE\nSenior Engineer, TechCorp (2020-Present)\n"
                "- Led development of microservices architecture serving 1M users\n"
                "- Reduced system latency by 40% through database query optimization\n"
                "- Mentored team of 4 junior engineers\n\n"
                "EDUCATION\nBS Computer Science, MIT (2018)\nGPA: 3.9"
            ),
            (
                "SKILLS\nProgramming: Python, Go, TypeScript\n"
                "Frameworks: FastAPI, React, Django\n"
                "Infrastructure: AWS, Docker, Kubernetes, Terraform\n"
                "Databases: PostgreSQL, Redis, MongoDB"
            ),
        ],
        "impact": [
            (
                "Architected and deployed real-time data pipeline processing 10M events/day, "
                "reducing operational costs by $200K annually. "
                "Increased system throughput by 300% while maintaining 99.99% uptime. "
                "Delivered 3 months ahead of schedule under budget constraints."
            ),
            (
                "- Reduced page load time from 4.2s to 0.8s (81% improvement) via CDN caching\n"
                "- Grew API reliability from 95.2% to 99.7% SLA through circuit breaker patterns\n"
                "- Saved 120 engineering hours/month by automating deployment pipeline\n"
                "- Increased test coverage from 42% to 87% eliminating production incidents"
            ),
        ],
        "completeness": [
            (
                "CONTACT INFORMATION\nJohn Doe | john@example.com | +1-555-0100 | "
                "LinkedIn | GitHub: github.com/johndoe\n\n"
                "PROFESSIONAL SUMMARY\nSenior Software Engineer with 7 years experience.\n\n"
                "EXPERIENCE\n3 positions with dates, responsibilities, and achievements.\n\n"
                "EDUCATION\nBS Computer Science, Top University, 2017.\n\n"
                "SKILLS\nTechnical: Python, AWS, Docker, Kubernetes, PostgreSQL.\n\n"
                "CERTIFICATIONS\nAWS Solutions Architect Associate (2023)."
            ),
        ],
        "relevance": [
            (
                "Software engineer experienced in Python, JavaScript, cloud computing, "
                "machine learning, data pipelines, RESTful APIs, microservices, "
                "agile development, CI/CD, Docker, Kubernetes, PostgreSQL, Redis, "
                "system design, distributed systems, performance optimization."
            ),
            (
                "Full-stack developer proficient in React, Node.js, TypeScript, Next.js, "
                "GraphQL, REST APIs, SQL, NoSQL databases. "
                "Experience with AWS EC2, S3, Lambda, RDS, CloudFormation. "
                "Strong background in software architecture, design patterns, code review."
            ),
        ],
    },
    "data_engineer": {
        "clarity": [
            (
                "Data engineer with strong expertise in designing and maintaining scalable data pipelines. "
                "Documented ETL processes, data lineage, and schema designs clearly for data consumers. "
                "Communicated data architecture decisions to analytics and product teams. "
                "Maintained runbooks for pipeline incident response and recovery procedures."
            ),
        ],
        "impact": [
            (
                "Built real-time streaming pipeline processing 50M events/day with <500ms latency. "
                "Reduced ETL processing time from 6 hours to 45 minutes through Spark optimisation. "
                "Implemented data quality framework catching 98% of schema violations before loading. "
                "Saved $80K/year in cloud costs by optimising BigQuery partition pruning and clustering."
            ),
        ],
        "completeness": [
            (
                "CONTACT\nName | email | LinkedIn | GitHub\n\n"
                "SUMMARY\nData Engineer with 3+ years building batch and streaming data platforms.\n\n"
                "EXPERIENCE\nRoles showing: pipeline scale, tools used, data volume, reliability metrics.\n\n"
                "SKILLS\nBatch: Spark, Hive, dbt. Streaming: Kafka, Flink, Kinesis. "
                "Storage: S3, GCS, BigQuery, Snowflake, Redshift. Orchestration: Airflow, Prefect.\n\n"
                "PROJECTS\nEnd-to-end pipeline projects with architecture diagrams or GitHub links."
            ),
        ],
        "relevance": [
            (
                "Data engineer / ML engineer with skills in Apache Spark, Kafka, Airflow, "
                "TensorFlow, PyTorch, pandas, scikit-learn, feature engineering, "
                "model deployment, MLOps, data warehousing, ETL pipelines, "
                "BigQuery, Snowflake, dbt, real-time streaming architectures."
            ),
        ],
    },
    "product_manager": {
        "clarity": [
            (
                "Product manager with strong written and verbal communication skills. "
                "Authored clear product requirement documents (PRDs) reviewed by engineering and design. "
                "Presented product strategy and roadmap to C-level and board stakeholders. "
                "Communicated release notes and feature updates to internal teams and customers."
            ),
        ],
        "impact": [
            (
                "Launched 3 product features in Q1 driving 25% increase in DAU. "
                "Defined and executed A/B test strategy generating $1.5M additional ARR. "
                "Reduced customer support tickets by 40% through self-serve onboarding redesign. "
                "Prioritised roadmap achieving 92% on-time delivery across 8 engineering sprints."
            ),
        ],
        "completeness": [
            (
                "CONTACT\nName | email | LinkedIn\n\n"
                "SUMMARY\nProduct Manager with 4+ years in B2B SaaS, focused on growth and retention.\n\n"
                "EXPERIENCE\nRoles showing: product scope, team size, metrics owned, business outcomes.\n\n"
                "SKILLS\nProduct: Roadmapping, PRD writing, A/B testing, user research, analytics. "
                "Tools: Jira, Figma, Mixpanel, Amplitude, SQL.\n\n"
                "EDUCATION\nDegree with relevant coursework or certifications."
            ),
        ],
        "relevance": [
            (
                "Product manager with skills in product roadmap planning, user research, "
                "wireframing, A/B testing, data analysis, stakeholder management, "
                "agile/scrum methodology, Jira, product metrics, go-to-market strategy, "
                "competitive analysis, customer journey mapping."
            ),
        ],
    },
}

SUPPORTED_ROLES: list[dict[str, str]] = [
    {"id": "ml_engineer", "label": "ML / AI Engineer"},
    {"id": "data_scientist", "label": "Data Scientist"},
    {"id": "software_engineer", "label": "Software Engineer"},
    {"id": "data_engineer", "label": "Data Engineer"},
    {"id": "product_manager", "label": "Product Manager"},
]
