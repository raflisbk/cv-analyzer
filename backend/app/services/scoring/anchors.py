"""
Ideal CV anchor text templates per D-08.
These represent high-quality CV segments used as cosine similarity targets.
Content is agent's discretion - chosen to maximally differentiate good vs poor CVs.
"""

# CLARITY: Readable, well-structured, concise bullet points
CLARITY_ANCHORS: list[str] = [
    (
        "Results-driven software engineer with 5+ years of experience building "
        "distributed systems. Clear communication skills demonstrated through leading "
        "cross-functional teams and technical documentation. Proven track record of "
        "delivering projects on time with measurable outcomes."
    ),
    (
        "Managed end-to-end product development lifecycle. "
        "Collaborated with stakeholders to define requirements. "
        "Presented technical proposals to C-level executives. "
        "Authored comprehensive technical specifications and runbooks."
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
]

# IMPACT: Quantifiable achievements, strong action verbs, measurable results
IMPACT_ANCHORS: list[str] = [
    (
        "Architected and deployed real-time data pipeline processing 10M events/day, "
        "reducing operational costs by $200K annually. "
        "Increased system throughput by 300% while maintaining 99.99% uptime. "
        "Delivered 3 months ahead of schedule under budget constraints."
    ),
    (
        "- Reduced page load time from 4.2s to 0.8s (81% improvement) by implementing CDN caching\n"
        "- Grew API reliability from 95.2% to 99.7% SLA through circuit breaker patterns\n"
        "- Saved 120 engineering hours/month by automating deployment pipeline\n"
        "- Increased test coverage from 42% to 87% eliminating production incidents"
    ),
    (
        "Spearheaded migration from monolithic to microservices architecture serving 500K users. "
        "Reduced time-to-market for new features by 60%. "
        "Achieved 40% reduction in infrastructure costs ($150K/year savings). "
        "Built and scaled engineering team from 3 to 12 engineers."
    ),
    (
        "Led A/B testing framework that increased conversion rate by 23% ($1.2M revenue impact). "
        "Designed fraud detection system preventing $800K in losses. "
        "Implemented ML model achieving 94% accuracy (15% improvement over baseline). "
        "Shipped 47 features in 12 months with zero critical production incidents."
    ),
]

# COMPLETENESS: All required sections present with appropriate depth
COMPLETENESS_ANCHORS: list[str] = [
    (
        "CONTACT INFORMATION\nJohn Doe | john@example.com | +1-555-0100 | "
        "LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe\n\n"
        "PROFESSIONAL SUMMARY\nSenior Software Engineer with 7 years experience.\n\n"
        "EXPERIENCE\n3 positions with dates, responsibilities, and achievements.\n\n"
        "EDUCATION\nBS Computer Science, Top University, 2017.\n\n"
        "SKILLS\nTechnical: Python, AWS, Docker, Kubernetes, PostgreSQL.\n\n"
        "CERTIFICATIONS\nAWS Solutions Architect Associate (2023)."
    ),
    (
        "Complete professional CV containing: full contact details with email and phone, "
        "professional summary with years of experience and key strengths, "
        "chronological work experience with company names dates and achievements, "
        "education with institution degree field and graduation year, "
        "comprehensive skills section with technologies and tools, "
        "certifications and professional development activities."
    ),
    (
        "Work history spanning 5+ years with at least 2 positions. "
        "Each role includes: company name, job title, employment dates, "
        "3-5 bullet points describing responsibilities and achievements. "
        "Education section with degree, institution, graduation year. "
        "Skills section listing 10+ relevant technical competencies."
    ),
    (
        "Projects section with 2-3 significant projects including: "
        "project name, technologies used, your role, measurable impact. "
        "Languages section if bilingual. Awards and recognition. "
        "Professional associations and memberships. Publications or talks."
    ),
]

# RELEVANCE: Keyword-rich, ATS-optimized, role-specific terminology
RELEVANCE_ANCHORS: list[str] = [
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
    (
        "Data engineer / ML engineer with skills in Apache Spark, Kafka, Airflow, "
        "TensorFlow, PyTorch, pandas, scikit-learn, feature engineering, "
        "model deployment, MLOps, data warehousing, ETL pipelines, "
        "BigQuery, Snowflake, dbt, real-time streaming architectures."
    ),
    (
        "DevOps / platform engineer skilled in Terraform, Ansible, Helm, "
        "Prometheus, Grafana, ELK Stack, Jenkins, GitHub Actions, "
        "infrastructure as code, site reliability engineering, "
        "disaster recovery, capacity planning, cost optimization."
    ),
]
