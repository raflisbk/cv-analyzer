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
    (
        "Marketing manager with strong written and verbal communication. "
        "Created brand messaging frameworks adopted across 3 product lines. "
        "Presented quarterly performance reports to executive leadership. "
        "Coordinated cross-departmental campaigns with clear briefs and timelines."
    ),
    (
        "Operations supervisor overseeing daily production of 500+ units. "
        "Maintained clear shift handover logs reducing miscommunication errors by 60%. "
        "Trained 15 new team members with structured onboarding materials. "
        "Documented standard operating procedures for 12 critical workflows."
    ),
    (
        "Customer service representative handling 50+ inquiries daily. "
        "Communicated product information clearly achieving 95% satisfaction rating. "
        "Resolved complaints through active listening and empathetic communication. "
        "Escalated complex issues with detailed context for faster resolution."
    ),
    (
        "Financial analyst presenting quarterly reports to board of directors. "
        "Translated complex financial data into clear executive summaries. "
        "Maintained organized documentation for audit compliance. "
        "Collaborated with accounting and operations teams on budget planning."
    ),
    # ML / AI Engineer
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
        "Data: pandas, NumPy, SQL, BigQuery, Apache Spark\n"
        "Deployment: FastAPI, Celery, Redis, PostgreSQL"
    ),
    # Junior / early-career
    (
        "Fresh graduate with strong foundation in software engineering and data science. "
        "Completed 3 production projects during internship with clear deliverables. "
        "Documented code and processes thoroughly for team knowledge transfer. "
        "Communicated progress and blockers proactively in agile stand-ups."
    ),
]


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
    (
        "Increased regional sales by 35% within 12 months through targeted outreach strategy. "
        "Acquired 200+ new B2B clients generating Rp 5M ARR. "
        "Reduced customer churn from 18% to 8% implementing retention programs. "
        "Grew social media engagement by 150% driving 40% increase in inbound leads."
    ),
    (
        "Reduced production defect rate from 5.2% to 0.8% implementing quality control system. "
        "Improved warehouse efficiency by 45% through layout optimization. "
        "Cut delivery time from 5 days to 2 days with route planning software. "
        "Saved Rp 200M annually through supplier negotiation and inventory optimization."
    ),
    (
        "Managed F&B outlet serving 300+ covers daily with 4.8/5 customer rating. "
        "Reduced food waste by 25% through portion standardization. "
        "Trained 20+ staff achieving consistent service quality scores above 90%. "
        "Grew repeat customer rate from 30% to 55% through loyalty program."
    ),
    (
        "Led team of 25 factory workers achieving 99.2% production target fulfillment. "
        "Reduced machine downtime by 35% through preventive maintenance scheduling. "
        "Implemented 5S methodology cutting workplace incidents by 50%. "
        "Improved production output by 20% without additional headcount."
    ),
    (
        "Boosted hotel occupancy rate from 65% to 85% through digital marketing campaigns. "
        "Managed events for 500+ guests with zero complaints. "
        "Increased average guest spend by 30% through upselling training program. "
        "Achieved Tripadvisor ranking improvement from #45 to #8 in local area."
    ),
    (
        "Processed 1000+ insurance claims monthly with 98% accuracy rate. "
        "Reduced claim processing time from 14 days to 5 days. "
        "Handled customer satisfaction score of 4.7/5 across 500+ interactions. "
        "Managed portfolio of 200+ client accounts worth Rp 10B in premiums."
    ),
    # ML / AI Engineer impact
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
    # Junior / early-career impact
    (
        "Completed 2 production ML features during 3-month internship shipped to 10K users. "
        "Improved recommendation click-through rate by 8% through feature engineering. "
        "Reduced data preprocessing pipeline runtime by 45% using vectorised pandas operations. "
        "Contributed 5 merged pull requests with 100% test coverage."
    ),
]


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
    (
        "Professional CV with clear structure: name and contact information prominently displayed, "
        "career objective or professional summary tailored to target role, "
        "employment history with specific dates and quantified achievements, "
        "relevant skills and competencies section, "
        "education and professional certifications, "
        "references available upon request."
    ),
    (
        "Resume with measurable impact: each experience entry has 3+ bullet points, "
        "at least half of bullet points include numbers or percentages, "
        "skills section matches job requirements, "
        "education includes GPA if strong, relevant coursework, "
        "certifications section with dates and issuing organizations."
    ),
    # ML / AI Engineer completeness
    (
        "CONTACT\nName | email | phone | LinkedIn | GitHub: github.com/username | Portfolio: username.vercel.app\n\n"
        "SUMMARY\nJunior ML Engineer with 1+ year production experience in computer vision and NLP.\n\n"
        "EXPERIENCE\n2 roles with dates, tech stack used, model metrics, and business impact.\n\n"
        "PROJECTS\n3 projects with: name, GitHub link, tech stack, dataset size, evaluation metric.\n\n"
        "EDUCATION\nS1 Computer Science / Informatics, GPA 3.5+\n\n"
        "SKILLS\nGrouped by category: Languages, ML Frameworks, MLOps, Cloud, Databases.\n\n"
        "CERTIFICATIONS\nTensorFlow Developer Certificate | Google Cloud Professional ML Engineer"
    ),
    (
        "Complete ML engineer CV with: public GitHub profile with pinned repositories, "
        "Kaggle profile or competition rankings, portfolio website or demo links, "
        "projects section listing model architecture and performance metrics, "
        "skills grouped as programming languages, ML frameworks, deployment tools, "
        "cloud platforms, and databases with proficiency indicators."
    ),
]


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
    (
        "Digital marketing specialist experienced in SEO, SEM, Google Ads, "
        "Facebook Ads, content marketing, social media management, "
        "email marketing, Google Analytics, conversion rate optimization, "
        "A/B testing, brand strategy, copywriting, marketing automation."
    ),
    (
        "Product manager with skills in product roadmap planning, user research, "
        "wireframing, A/B testing, data analysis, stakeholder management, "
        "agile/scrum methodology, Jira, product metrics, go-to-market strategy, "
        "competitive analysis, customer journey mapping."
    ),
    (
        "Financial analyst proficient in financial modeling, budgeting, forecasting, "
        "Excel, VBA, SQL, Tableau, Power BI, variance analysis, "
        "financial reporting, cash flow management, audit compliance, "
        "risk assessment, investment analysis, accounting principles."
    ),
    (
        "Human resources professional skilled in recruitment, talent acquisition, "
        "employee relations, performance management, HRIS systems, "
        "onboarding, training and development, compensation and benefits, "
        "labor law compliance, organizational development, HR analytics."
    ),
    (
        "Sales professional with experience in B2B sales, account management, "
        "cold calling, lead generation, CRM software, pipeline management, "
        "negotiation, closing deals, client relationship building, "
        "quota attainment, territory management, sales forecasting."
    ),
    (
        "Graphic designer experienced in Adobe Photoshop, Illustrator, InDesign, "
        "Figma, brand identity, typography, color theory, layout design, "
        "UI/UX design, responsive web design, print design, "
        "video editing, motion graphics, creative direction."
    ),
    (
        "Registered nurse with clinical skills in patient assessment, "
        "medication administration, IV therapy, wound care, "
        "electronic health records, patient education, critical thinking, "
        "emergency response, infection control, care planning."
    ),
    (
        "Teacher or educator experienced in lesson planning, classroom management, "
        "curriculum development, student assessment, differentiated instruction, "
        "educational technology, parent communication, collaborative learning, "
        "special needs accommodation, formative and summative assessment."
    ),
    (
        "Project manager skilled in project planning, risk management, "
        "stakeholder communication, budget tracking, resource allocation, "
        "Gantt charts, critical path method, scope management, "
        "quality assurance, team leadership, change management."
    ),
    (
        "Manufacturing or production engineer experienced in lean manufacturing, "
        "quality control, process improvement, Six Sigma, 5S, Kaizen, "
        "production planning, supply chain management, inventory control, "
        "CNC machining, PLC programming, SCADA, preventive maintenance."
    ),
    (
        "Hospitality professional with skills in guest relations, "
        "front office operations, housekeeping management, food and beverage service, "
        "event planning, reservation systems, revenue management, "
        "customer satisfaction, staff scheduling, health and safety compliance."
    ),
    # ML / AI Engineer relevance
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
    (
        "Data scientist with skills in statistical modelling, exploratory data analysis, "
        "pandas, NumPy, matplotlib, seaborn, Plotly, SQL, BigQuery, "
        "A/B testing, hypothesis testing, regression, classification, clustering, "
        "time series forecasting, feature engineering, cross-validation."
    ),
]
