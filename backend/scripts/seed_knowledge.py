"""
RAG knowledge base seed script.
Combines hardcoded expert content + web scraping for comprehensive CV best practices.

Usage:
    conda activate sbk-cv-analyzer
    cd backend
    python scripts/seed_knowledge.py
"""

import asyncio
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import requests
from sqlalchemy import text

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.knowledge_chunk import KnowledgeChunk
from app.services.rag.chunker import chunk_text
from app.services.rag.embeddings import get_rag_embedding

HARDCODED_KNOWLEDGE = [
    {
        "source": "skills_section_guide",
        "section_type": "skills_best_practice",
        "content": """How to Write the Skills Section of Your Resume

Technical Skills (Hard Skills)
Technical skills are specific, teachable abilities that can be defined and measured.
Examples by category:

Programming and Development:
- Languages: Python, JavaScript, Java, C#, TypeScript, Go, Rust, PHP, Ruby
- Frameworks: React, Angular, Vue, Django, Flask, Express, Spring, FastAPI
- Databases: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch
- Cloud: AWS, Azure, Google Cloud Platform, Heroku, Vercel
- Tools: Git, Docker, Kubernetes, Jenkins, GitHub Actions, Jira
- Data: SQL, pandas, NumPy, TensorFlow, PyTorch, Tableau, Power BI

Design and Creative:
- Design Tools: Figma, Adobe XD, Sketch, Photoshop, Illustrator
- UI/UX: Wireframing, prototyping, user research, accessibility
- Multimedia: Video editing, sound design, animation

Soft Skills (People Skills)
Soft skills are interpersonal attributes that characterize your relationship with other people.

Communication Skills:
- Written communication: Clear emails, reports, documentation
- Verbal communication: Presentations, meetings, client interaction
- Active listening: Understanding stakeholder needs

Leadership and Management:
- Team leadership: Managing direct reports, mentoring
- Project management: Agile, Scrum, Kanban, JIRA
- Decision making: Data-driven decisions, risk assessment
- Conflict resolution: Mediating disagreements, negotiation

Problem Solving:
- Analytical thinking: Breaking down complex problems
- Critical thinking: Evaluating information objectively
- Creativity: Innovative solutions, thinking outside the box
- Research: Gathering and analyzing information

Adaptability:
- Learning quickly: Picking up new technologies
- Flexibility: Adapting to changing priorities
- Resilience: Recovering from setbacks
- Time management: Prioritizing tasks, meeting deadlines

How to Format Skills Section

Option 1: Categorized List (Recommended)
TECHNICAL SKILLS
- Languages: Python, JavaScript, SQL
- Frameworks: React, Django, FastAPI
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS, Docker, Kubernetes

SOFT SKILLS
- Communication, Leadership, Problem-solving
- Team collaboration, Project management

Option 2: Bullet Points
Skills: Python, React, PostgreSQL, AWS, Git, JIRA,
Team leadership, Project management, Data analysis

Best Practices:
1. List 6-10 skills maximum
2. Include both technical and soft skills
3. Match skills to job description keywords
4. Only include skills you can demonstrate
5. Group related skills together
6. Place skills section prominently for technical roles
7. Remove outdated or irrelevant skills
8. Indicate proficiency level if helpful
9. Include certifications alongside relevant skills
10. Be honest about your skill level

Skills to Avoid:
- Generic phrases like "computer skills" or "hard worker"
- Basic skills assumed for your profession
- Skills unrelated to target job
- Outdated technologies (unless specifically requested)
- Vague skills without context""",
    },
    {
        "source": "common_resume_mistakes",
        "section_type": "common_mistakes",
        "content": """Common Resume Mistakes to Avoid

1. Typos and Grammatical Errors
Problem: Spelling mistakes, wrong verb tense, subject-verb disagreement
Impact: Shows lack of attention to detail, unprofessional
Solution: Proofread multiple times, use grammar checker, ask others to review

Examples:
- Wrong: "Manger" instead of "Manager"
- Wrong: "Lead a team" instead of "Led a team"
- Wrong: "Responsible for managing" instead of "Managed"

2. Generic Objective Statements
Problem: Vague statements like "Seeking challenging position"
Impact: Wastes space, adds no value
Solution: Replace with professional summary highlighting your value

Weak: "Seeking a challenging position to grow my career"
Strong: "Software Engineer with 5 years experience building scalable web applications"

3. Including Irrelevant Information
Problem: Personal details like age, marital status, hobbies
Impact: Unprofessional, can lead to discrimination
Solution: Focus on qualifications relevant to the job

Remove:
- Age, birthdate, marital status
- Number/names of children
- Religious or political affiliations
- Photo (not standard in US/UK resumes)
- Hobbies unless relevant to job
- Full address (city/state is sufficient)

4. Poor Formatting
Problem: Inconsistent fonts, spacing issues, cluttered layout
Impact: Hard to read, unprofessional appearance
Solution: Use clean, consistent formatting with white space

Formatting mistakes:
- Multiple fonts or font sizes
- Inconsistent bullet points
- Too much text without breaks
- Walls of text
- Inconsistent spacing
- Using tables or graphics (ATS issues)

5. Lack of Quantifiable Achievements
Problem: Vague statements without numbers or metrics
Impact: Does not show real impact or value
Solution: Use specific numbers, percentages, and results

Weak: "Increased sales"
Strong: "Increased sales by 35% generating $500K in new revenue"

Weak: "Managed a team"
Strong: "Led team of 15 developers, achieving 120% of annual targets"

6. Using Passive Language
Problem: Weak phrases like "Responsible for", "Assisted with", "Helped"
Impact: Does not show leadership or initiative
Solution: Use strong action verbs

Replace:
- "Responsible for" -> "Managed", "Led", "Developed"
- "Assisted with" -> "Contributed to", "Supported"
- "Helped" -> "Collaborated", "Facilitated"
- "Worked on" -> "Developed", "Implemented", "Created"

7. Resume Too Long
Problem: Exceeding 2 pages for most positions
Impact: Recruiters will not read it all
Solution: Keep it concise (1 page for entry-mid level, 2 max for senior)

8. Not Tailoring to the Job
Problem: One resume for all applications
Impact: Does not match job requirements
Solution: Customize for each position, use keywords from job description

9. Including References
Problem: "References available upon request"
Impact: Wastes valuable space
Solution: Remove entirely (employers ask if needed)

10. Outdated Contact Information
Problem: Wrong email, phone, or broken LinkedIn link
Impact: Employers cannot reach you
Solution: Verify all contact info before submitting

11. Using Personal Pronouns
Problem: "I managed", "My responsibilities included"
Impact: Unnecessary, wastes space
Solution: Remove all "I", "me", "my" references

12. Focusing on Duties Instead of Achievements
Problem: Listing job responsibilities instead of accomplishments
Impact: Does not differentiate you from others
Solution: Focus on what you achieved, not just what you did

13. Inconsistent Date Formats
Problem: Mix of "01/2020", "Jan 2020", "2020"
Impact: Unprofessional, confusing
Solution: Use consistent format (MM/YYYY or "Month YYYY")

14. Missing Key Keywords
Problem: Not including terms from job description
Impact: ATS systems may reject resume
Solution: Incorporate relevant keywords naturally

Quick Checklist Before Submitting:
- Spell-checked and grammar-checked
- All contact information current
- Tailored to specific job
- Quantified achievements with numbers
- Strong action verbs throughout
- Consistent formatting
- Appropriate length (1-2 pages)
- No personal pronouns
- Keywords from job description included
- Saved as PDF unless requested otherwise""",
    },
    {
        "source": "ats_formatting_guide",
        "section_type": "formatting_ats",
        "content": """ATS-Friendly Resume Formatting Guide

What is an ATS?
Applicant Tracking System (ATS) is software that filters and ranks resumes
based on keywords, format, and criteria. Used by 75%+ of large companies.

ATS-Friendly Formatting Rules

1. Use Standard Section Headings
Good: "Work Experience", "Education", "Skills", "Summary"
Bad: "My Journey", "What I Learned", "Stuff I'm Good At"
Why: ATS looks for standard headings to categorize information

2. Choose Simple, ATS-Compatible Fonts
Recommended Fonts: Arial, Calibri, Helvetica, Times New Roman, Georgia, Verdana
Avoid: Decorative fonts, custom/unusual fonts, font sizes below 10pt

3. Use Standard Reverse-Chronological Format
Order:
1. Header/Contact Info
2. Professional Summary
3. Work Experience (most recent first)
4. Education
5. Skills
6. Optional: Certifications, Projects

4. Avoid Graphics, Images, and Tables
Avoid: Photos, logos, charts, graphs, text boxes, tables, columns, borders, shading, headers/footers
Why: ATS cannot parse these elements correctly

5. Use Standard Bullet Points
Good: Standard round bullets
Bad: Arrows, checkmarks, custom symbols, emojis
Why: Special characters may not parse correctly

6. Include Relevant Keywords
Strategies:
- Use exact terms from job description
- Include industry-standard terminology
- Spell out abbreviations first: "Customer Relationship Management (CRM)"
- Use both acronyms and full terms
- Place keywords throughout resume, not just in skills section

7. Optimize Contact Information
Format:
John Doe
john.doe@email.com | (555) 123-4567 | LinkedIn Profile
City, State (ZIP optional)

Tips:
- Use professional email
- Include LinkedIn URL (clean profile URL)
- Do not include full street address (city/state is enough)

8. File Format and Naming
Best: .docx (Word) or .pdf (if requested)
File name: "FirstName_LastName_Resume.pdf"

9. Date Format Consistency
Good formats: MM/YYYY (01/2020), Month YYYY (January 2020), Present (for current roles)
Avoid: Mix of formats, just years, ambiguous formats

10. Experience Section Format
For each role:

Job Title | Company Name | City, State
MM/YYYY to Present

- Achievement with numbers (Start with action verb)
- Another quantified accomplishment
- Technical skills or tools used

Example:
Software Engineer | Tech Corp | San Francisco, CA
01/2020 to Present

- Developed microservices architecture reducing latency by 40%
- Led team of 5 engineers to launch e-commerce platform
- Implemented CI/CD pipeline reducing deployment time by 60%

Testing Your ATS Compatibility:
1. Copy resume text into plain text editor. Does formatting remain intact?
2. Use ATS scanning tools: Jobscan.co, Resume Worded
3. Check with text-only resume viewer""",
    },
    {
        "source": "bullet_point_framework",
        "section_type": "experience",
        "content": """Writing Impactful Resume Bullet Points

The APR Framework (Action + Project/Problem + Result)

Every bullet point should follow this structure:
1. ACTION: What did you do? (Start with a strong action verb)
2. PROJECT/PROBLEM: What was the context or challenge?
3. RESULT: What was the quantifiable outcome?

Example Transformations:

Weak: "Responsible for social media"
APR: "Managed social media campaigns across 4 platforms, increasing follower engagement by 45% over 6 months"

Weak: "Helped with website redesign"
APR: "Collaborated with design team to rebuild company website, reducing page load time by 60% and increasing organic traffic by 30%"

Weak: "Worked on customer service"
APR: "Resolved 200+ customer tickets weekly with 98% satisfaction rating, implementing new FAQ system that reduced repeat inquiries by 25%"

The STAR Method for Resume Bullets

S - Situation: Context of the task
T - Task: What needed to be done
A - Action: What you specifically did
R - Result: Quantifiable outcome

Example:
Situation: Company was losing customers due to slow app performance
Task: Improve application response time
Action: Profiled and optimized database queries, implemented Redis caching layer
Result: Reduced API response time from 3s to 200ms, decreasing customer churn by 15%

Strong Action Verbs by Category

Leadership: Led, Directed, Managed, Supervised, Coordinated, Orchestrated, Spearheaded, Championed
Communication: Presented, Negotiated, Persuaded, Articulated, Conveyed, Drafted, Authored
Analysis: Analyzed, Evaluated, Assessed, Diagnosed, Investigated, Identified, Discovered
Creation: Developed, Designed, Built, Created, Established, Launched, Initiated, Pioneered
Improvement: Optimized, Streamlined, Enhanced, Improved, Accelerated, Upgraded, Refined
Financial: Reduced costs, Generated revenue, Budgeted, Forecasted, Saved, Increased ROI
Technical: Engineered, Implemented, Deployed, Automated, Architected, Programmed, Configured
Research: Researched, Discovered, Surveyed, Examined, Measured, Benchmarked, Validated

Quantification Techniques

Use numbers whenever possible:
- Percentages: "Increased conversion rate by 25%"
- Dollar amounts: "Saved $50K annually through process optimization"
- Time saved: "Reduced processing time from 4 hours to 15 minutes"
- Volume: "Managed database of 500K+ user records"
- Team size: "Led cross-functional team of 12 engineers"
- Frequency: "Processed 10,000+ transactions daily with 99.9% accuracy"
- Rankings: "Ranked #1 out of 50 sales representatives"

When You Cannot Quantify:
- Use qualitative impact: "Streamlined onboarding process, reducing new hire ramp-up time"
- Use scope indicators: "Managed client portfolio spanning 3 industries"
- Use awards/recognition: "Recognized as top performer by VP of Engineering"

Do's and Don'ts for Bullet Points

Do:
- Start every bullet with an action verb
- Include numbers in at least 50% of your bullets
- Keep each bullet to 1-2 lines maximum
- Prioritize bullets by relevance and impact
- Use consistent tense (past for previous jobs, present for current)
- Focus on achievements, not responsibilities
- Tailor bullets to match job description keywords

Don't:
- Start bullets with "Responsible for" or "Helped with"
- Use personal pronouns (I, me, my, we)
- Write paragraphs instead of bullets
- List duties without outcomes
- Include vague claims without evidence
- Copy paste job descriptions
- Use the same bullets for every job application""",
    },
    {
        "source": "resume_summary_guide",
        "section_type": "summary_best_practice",
        "content": """How to Write a Resume Summary

A resume summary is a 2-3 sentence professional introduction at the top of your resume
that highlights your most impressive achievements, key skills, and career goals.

Resume Summary Formula:
[Adjective/Noun] + [Job Title] + [Years of Experience] + [Key Achievement/Skill] + [Value Proposition]

Examples by Career Level

Entry Level (0-2 years):
"Recent Computer Science graduate with internship experience at Fortune 500 company.
Proficient in Python, React, and cloud technologies. Built an e-commerce platform serving
500+ daily users as capstone project."

"Motivated marketing graduate with hands-on experience in digital campaigns.
Increased social media engagement by 40% during university internship.
Skilled in Google Analytics, content strategy, and SEO optimization."

Mid Level (3-7 years):
"Full-stack developer with 5 years of experience building scalable web applications.
Led migration of legacy monolith to microservices, reducing deployment time by 70%.
Expert in React, Node.js, PostgreSQL, and AWS cloud infrastructure."

"Data analyst with 4 years of experience turning complex datasets into actionable insights.
Built predictive models that improved customer retention by 25%.
Proficient in Python, SQL, Tableau, and machine learning frameworks."

Senior Level (8+ years):
"Engineering Director with 12 years leading high-performing development teams.
Scaled platform from 10K to 2M users while maintaining 99.9% uptime.
Drove adoption of DevOps practices across 5 product teams, reducing release cycle from monthly to daily."

"Senior Product Manager with 10 years of experience in B2B SaaS.
Launched 3 products generating $15M+ in annual recurring revenue.
Expert in agile methodologies, cross-functional leadership, and data-driven decision making."

Career Change:
"Former teacher transitioning into UX research, bringing 8 years of user-centered
communication and stakeholder management experience. Completed Google UX Design
certificate with portfolio of 4 case studies. Skilled in user interviews, usability
testing, and wireframing with Figma."

"Military veteran transitioning to project management. Led teams of 30+ personnel
in high-pressure environments with zero safety incidents. PMP certified with experience
in logistics planning, risk assessment, and cross-functional coordination."

Common Summary Mistakes:

Weak Summaries (Avoid):
- "Hardworking professional seeking new opportunities"
- "Detail-oriented team player with excellent communication skills"
- "Looking for a challenging position to grow my career"
- "Experienced professional with diverse skills"

Why these fail: Generic, no specific value, could describe anyone.

Strong Summary Characteristics:
1. Specific job title and industry
2. Years of relevant experience
3. At least one quantified achievement
4. Key technical or domain skills
5. Clear value proposition for the employer

Summary vs Objective Statement

Objective Statement (Outdated):
"Seeking a position as a software developer where I can utilize my skills and grow professionally."

Professional Summary (Modern):
"Software developer with 3 years of experience building RESTful APIs and microservices.
Reduced system latency by 40% through database optimization.
Proficient in Python, Docker, Kubernetes, and CI/CD pipelines."

Tips for Writing Your Summary:
1. Tailor it for each job application
2. Keep it to 2-3 sentences (about 50 words)
3. Include keywords from the job description
4. Focus on what you bring to the employer, not what you want
5. Use numbers and specific achievements
6. Avoid first-person pronouns (no "I am" or "My")
7. Place it immediately below your contact information""",
    },
    {
        "source": "quantification_guide",
        "section_type": "achievement_metrics",
        "content": """How to Quantify Your Resume Achievements

Why Quantify?
Numbers provide concrete evidence of your impact. Recruiters spend 6-10 seconds
scanning each resume, and numbers catch their attention immediately.

Quantified bullets are 40% more likely to result in an interview than non-quantified bullets.

Types of Metrics You Can Use

1. Revenue and Financial Impact
- "Increased quarterly revenue by $2.5M through upselling strategies"
- "Reduced operational costs by 30% saving $500K annually"
- "Generated $1.2M in new business through strategic partnerships"
- "Managed annual budget of $3.5M with 10% cost savings"

2. Efficiency and Time Savings
- "Reduced processing time from 4 hours to 15 minutes (93% improvement)"
- "Automated manual reporting, saving 20 hours per week for the team"
- "Streamlined approval workflow, cutting project delivery time by 50%"
- "Implemented CI/CD pipeline reducing deployment time from 2 days to 30 minutes"

3. Growth and Scale
- "Scaled platform from 10K to 500K monthly active users"
- "Grew email subscriber list from 5K to 50K in 12 months"
- "Expanded market presence to 3 new regions, increasing total revenue by 60%"
- "Built and led team from 3 to 25 engineers over 2 years"

4. Quality and Accuracy
- "Achieved 99.9% system uptime over 18 months"
- "Reduced bug count by 70% through automated testing framework"
- "Improved customer satisfaction score from 3.2 to 4.7 out of 5.0"
- "Maintained 98% accuracy rate on 500+ daily transactions"

5. People and Team Impact
- "Mentored 8 junior developers, 5 of whom were promoted within 18 months"
- "Managed cross-functional team of 15 across 3 time zones"
- "Trained 200+ employees on new CRM system within 2 weeks"
- "Reduced employee turnover by 25% through implementing career development programs"

6. Volume and Throughput
- "Processed 50,000+ support tickets monthly with first-response time under 2 hours"
- "Analyzed datasets of 10M+ records to identify market trends"
- "Managed inventory of 25,000 SKUs across 8 warehouse locations"
- "Handled client portfolio of 150+ accounts generating $8M in annual revenue"

7. Rankings and Recognition
- "Ranked #1 out of 200 sales representatives for 3 consecutive quarters"
- "Won 'Best Innovation' award out of 50+ submissions at company hackathon"
- "Recognized as top 5% performer in annual performance reviews"
- "Published 3 peer-reviewed papers with 100+ citations"

How to Find Your Numbers (If You Think You Have None)

Ask yourself:
- How many people did I work with or manage?
- How big was the budget or project?
- How long did a process take before and after my contribution?
- What percentage improvement can I estimate?
- How many customers, users, or clients were affected?
- How frequently did I perform this task?
- What was the size of the team, project, or dataset?

Estimated Numbers Are OK
If you do not know exact figures, reasonable estimates are acceptable:
- "Approximately 30% improvement in page load speed"
- "Managed team of roughly 10 developers"
- "Reduced processing time by an estimated 50%"

Just be prepared to discuss your methodology if asked in an interview.

Quantification Formulas

Before and After: "Reduced [metric] from X to Y, a Z% improvement"
Scale and Scope: "Managed [resource] of X [units] across Y [locations/teams]"
Frequency: "Processed X [units] [daily/weekly/monthly] with Y% [accuracy/satisfaction]"
Comparison: "Achieved X% [metric], outperforming team average of Y%"
Financial: "[Generated/Saved] $X through [action], representing Y% [growth/reduction]""",
    },
    {
        "source": "mit_technical_resume",
        "section_type": "technical_resume",
        "content": """Technical Resume Writing Guide for Engineers and Developers

Recruiters spend 6-10 seconds reviewing each resume. Make every word count.

Formatting Rules for Technical Resumes

1. Length: 1 page for early career (0-3 years), 2 pages max for experienced
2. Margins: 0.5-0.75 inches with adequate white space
3. Fonts: Arial, Calibri, Helvetica, or Times New Roman, 10-12pt
4. Order: Contact Info, Summary, Experience, Education, Skills, Projects
5. Bullets: Standard round bullets, not arrows or symbols
6. No: Tables, columns, graphics, images, or complex layouts

Experience Section for Technical Roles

Format for each position:
Company Name, City, State
Your Title, Dates (MM/YYYY to MM/YYYY or Present)

- Bullet 1: Strongest achievement with numbers
- Bullet 2: Technical accomplishment with tools used
- Bullet 3: Collaboration or leadership highlight
- Bullet 4: Additional impact or scope

Technical Bullet Point Examples

Software Development:
- Developed RESTful APIs using Python and Flask, serving 100K+ daily requests with 99.9% uptime
- Implemented caching mechanisms using Redis, reducing server response time by 35%
- Refactored legacy codebase from monolith to microservices, improving deploy frequency from monthly to daily
- Created automated testing framework covering 85% of codebase, decreasing regression bugs by 70%

Data Science and ML:
- Built machine learning models predicting user churn with 92% accuracy, reducing attrition by 18%
- Analyzed 10M+ data points using Python and Spark, identifying revenue optimization opportunities worth $2M
- Developed NLP pipeline processing 50K documents daily for automated compliance monitoring
- Designed A/B testing framework used by 5 product teams, improving experiment velocity by 3x

DevOps and Infrastructure:
- Designed CI/CD pipeline using GitHub Actions and Docker, reducing deployment time from 4 hours to 15 minutes
- Managed Kubernetes clusters hosting 200+ microservices across 3 AWS regions with 99.95% availability
- Implemented infrastructure-as-code with Terraform, reducing environment provisioning time by 80%
- Set up monitoring and alerting with Prometheus and Grafana, reducing MTTR from 4 hours to 30 minutes

Security:
- Conducted security audits identifying 50+ vulnerabilities across company web applications
- Implemented zero-trust network architecture reducing unauthorized access incidents by 90%
- Led SOC 2 Type II compliance effort, achieving certification in under 6 months

Projects Section Tips

Include personal and academic projects if they demonstrate relevant skills:
- Open source contributions (link to GitHub)
- Hackathon projects with awards
- Personal projects with measurable impact
- Research projects with published results

Format:
Project Name | Technologies Used | Date
- What you built and its impact
- Technical challenges you solved
- Results or metrics if available

Example:
Real-Time Chat Application | React, WebSocket, Redis, PostgreSQL | 2024
- Built scalable chat system supporting 5K concurrent users with sub-100ms message delivery
- Implemented message persistence with Redis pub/sub and PostgreSQL storage
- Deployed on AWS with auto-scaling, handling 10x traffic spikes

Education Section for Technical Roles

Include:
- Institution name and location
- Degree and major
- Graduation date or expected date
- GPA (if 3.5+, include scale)
- Relevant coursework (5-6 courses, max 2 lines)
- Academic honors or awards

Skills Section Best Practices

Group by category:
TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, Go
Frameworks: React, Django, FastAPI, Express.js
Cloud and Infrastructure: AWS, Docker, Kubernetes, Terraform
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
Tools: Git, CI/CD, Linux, Prometheus, Grafana

CERTIFICATIONS
AWS Solutions Architect Associate (2024)
Google Cloud Professional Data Engineer (2023)

Tailoring for Technical Roles

Analyze the job description for:
- Repeated action verbs (optimize, develop, architect, scale)
- Required technologies and frameworks
- Emphasized soft skills (collaboration, communication, mentoring)
- Company values or culture keywords

Then mirror those keywords in your resume bullets and summary.

Key Takeaways for Technical Resumes:
1. Quantify everything with numbers
2. Use strong action verbs, not "responsible for"
3. Focus on impact and results, not duties
4. Simplify technical jargon for broader audience
5. Include both technical and soft skills
6. Tailor for each role with matching keywords
7. Keep formatting clean and ATS-friendly""",
    },
    {
        "source": "career_change_resume",
        "section_type": "career_change",
        "content": """Resume Writing Guide for Career Changers

Switching careers is common. Your resume should bridge your past experience
to your target role by emphasizing transferable skills and relevant accomplishments.

Core Strategy: Emphasize Transferable Skills

Transferable skills are abilities that apply across industries and roles:

Communication Skills:
- Writing reports, proposals, or documentation
- Presenting to stakeholders, clients, or leadership
- Training or mentoring colleagues
- Negotiating with vendors or partners

Analytical Skills:
- Data analysis and interpretation
- Problem identification and solution design
- Research and benchmarking
- Budget management and financial analysis

Leadership Skills:
- Team management and delegation
- Project planning and execution
- Stakeholder management
- Change management and process improvement

Technical Skills:
- Software proficiency (spreadsheets, databases, CRM, project management tools)
- Data visualization and reporting
- Process automation
- Digital literacy and adaptability

Resume Format for Career Changers

Use a hybrid/functional format that leads with skills rather than chronological experience:

1. Professional Summary: Clear statement of your target role and transferable strengths
2. Core Competencies: Keyword-rich section matching the target job
3. Relevant Experience: Reframe past roles to highlight applicable achievements
4. Education and Certifications: Include any new training or certifications in target field
5. Additional Experience: Brief mention of unrelated roles

Professional Summary Examples for Career Changers

Teacher to UX Designer:
"Certified UX designer with 8 years of experience in user-centered communication
and stakeholder engagement. Completed Google UX Design Professional Certificate
with portfolio of 4 case studies. Skilled in user research, wireframing, and
prototyping with Figma. Bringing strong empathy, facilitation, and presentation skills."

Military to Project Management:
"PMP-certified project manager with 10 years of leadership experience in
high-stakes environments. Led teams of 30+ personnel managing complex logistics
operations with $5M+ budgets. Expert in risk assessment, cross-functional
coordination, and performance optimization. Completed Google Project Management
Certificate."

Sales to Software Engineering:
"Full-stack developer with 5 years of client-facing experience in enterprise sales.
Completed coding bootcamp with focus on React, Node.js, and PostgreSQL. Built
3 full-stack applications demonstrating proficiency in REST APIs, database design,
and responsive UI. Bringing strong communication, requirements gathering, and
stakeholder management skills."

Healthcare to Data Analytics:
"Data analyst with 6 years of clinical experience and strong quantitative foundation.
Completed SQL and Python certifications with portfolio of 5 data analysis projects.
Skilled in statistical analysis, data visualization with Tableau, and healthcare
data compliance (HIPAA). Combining domain expertise with technical analytics skills."

Reframing Past Experience

Key technique: Rewrite bullets to emphasize outcomes and skills relevant to your target role.

Original (Teacher): "Developed lesson plans for 150 students across 5 subjects"
Reframed (for Project Management): "Designed and executed project plans for 5 concurrent initiatives, managing timelines and deliverables for 150+ stakeholders"

Original (Military): "Supervised daily operations of 30-person logistics team"
Reframed (for Operations Management): "Directed cross-functional team of 30 in daily operations, achieving 100% mission readiness through optimized resource allocation"

Original (Retail): "Managed inventory and visual merchandising for flagship store"
Reframed (for Supply Chain): "Oversaw inventory management for $2M+ in merchandise, implementing demand forecasting that reduced overstock by 20%"

Tips for Career Changers:
1. Lead with your target job title in the summary
2. Include relevant certifications prominently
3. Use the target industry's terminology and keywords
4. Create a portfolio or personal projects section to demonstrate new skills
5. Network in your target industry for referrals
6. Consider a skills-based rather than chronological format
7. Address the career change confidently in cover letters and interviews
8. Highlight continuous learning and adaptability
9. Use your unique background as a differentiator, not a liability
10. Tailor aggressively for each application""",
    },
    {
        "source": "education_section_guide",
        "section_type": "education_tips",
        "content": """How to Write the Education Section of Your Resume

The education section validates your qualifications and can compensate for
limited work experience, especially for recent graduates.

When to Feature Education Prominently

Place education near the top (after summary) when:
- You are a recent graduate (within 3 years)
- Your degree is directly relevant to the target role
- You have limited work experience
- You are in academia or research

Place education at the bottom when:
- You have 5+ years of relevant work experience
- Your degree is not directly related to your career
- Your experience speaks louder than your credentials

Essential Elements

Required:
- Institution name and location (city, state/country)
- Degree earned (e.g., Bachelor of Science in Computer Science)
- Graduation date (month and year, or expected graduation)

Optional but Recommended:
- GPA (only include if 3.5 or higher on a 4.0 scale)
- Relevant coursework (5-6 courses maximum)
- Academic honors (Dean's List, cum laude, magna cum laude)
- Awards and scholarships
- Thesis or capstone project title
- Study abroad experience

Formatting Examples

Standard Format:
Massachusetts Institute of Technology (MIT)
Cambridge, MA
Bachelor of Science in Computer Science
Graduated: May 2024 | GPA: 3.8/4.0
Relevant Coursework: Data Structures, Algorithms, Machine Learning, Database Systems, Distributed Computing

With Honors:
Stanford University
Stanford, CA
Master of Science in Data Science, cum laude
Graduated: June 2023 | GPA: 3.9/4.0
Thesis: "Predictive Modeling for Healthcare Outcomes Using Ensemble Methods"

Multiple Degrees:
University of California, Berkeley
Berkeley, CA
Master of Business Administration (MBA), 2022
Bachelor of Arts in Economics, 2018

In-Progress Degree:
Georgia Institute of Technology
Atlanta, GA
Master of Science in Computer Science
Expected Graduation: December 2025
Current GPA: 3.7/4.0

Relevant Coursework Strategy

Only include coursework that:
- Directly relates to the target job
- Demonstrates specialized knowledge
- Fills a gap in your work experience

Good example:
Relevant Coursework: Machine Learning, Data Structures, Software Engineering, Cloud Computing, Cybersecurity

Bad example:
Relevant Coursework: English 101, Intro to Psychology, Art History, Physical Education

What Not to Include in Education

Avoid:
- High school education (once you have a college degree)
- Unrelated certifications (unless demonstrating continuous learning)
- GPAs below 3.5
- Dropout dates without explanation
- Irrelevant coursework
- Student ID numbers

Certifications Section

Separate from formal education, include professional certifications:

Format:
CERTIFICATIONS
- AWS Solutions Architect Associate, Amazon Web Services, 2024
- Google Data Analytics Professional Certificate, Google, 2023
- Certified ScrumMaster (CSM), Scrum Alliance, 2024
- TensorFlow Developer Certificate, Google, 2023

Online Courses and MOOCs:
Include only if from recognized platforms and relevant:
- Deep Learning Specialization, Coursera/Stanford, 2024
- Full Stack Web Development Bootcamp, freeCodeCamp, 2023
- Professional Certificate in Data Engineering, edX/IBM, 2024

Education Section Tips by Experience Level

Recent Graduate (0-2 years):
- Feature education prominently
- Include GPA if strong
- List relevant coursework
- Highlight academic projects
- Include honors and awards

Mid-Career (3-10 years):
- Keep education section brief
- Omit GPA and coursework
- Focus on degree and institution
- Add relevant certifications
- Consider adding executive education

Senior/Executive (10+ years):
- Briefest education section
- Degree, institution, year only
- Highlight advanced degrees (MBA, PhD)
- Include board certifications
- Executive education programs""",
    },
    {
        "source": "indonesian_cv_guide",
        "section_type": "indonesian_best_practice",
        "content": """Panduan Menulis CV dalam Bahasa Indonesia

Struktur CV yang Efektif

1. Data Pribadi (Header)
- Nama lengkap (tanpa gelar di header)
- Email profesional (nama.lastname@email.com)
- Nomor telepon/WhatsApp aktif
- LinkedIn (opsional tapi direkomendasikan)
- Domisili (kota/provinsi, tidak perlu alamat lengkap)
- Jangan cantumkan: tanggal lahir, agama, status pernikahan, foto (kecuali diminta)

2. Ringkasan Profesional (Professional Summary)
2-3 kalimat yang menjelaskan siapa Anda dan apa nilai yang Anda tawarkan.

Contoh kuat:
"Software Engineer dengan 5 tahun pengalaman mengembangkan aplikasi web berskala besar.
Memimpin migrasi dari monolith ke microservices, mengurangi waktu deployment sebesar 70%.
Ahli dalam React, Node.js, PostgreSQL, dan infrastruktur AWS."

Contoh lemah (hindari):
"Seorang profesional yang bersemangat dan berdedikasi tinggi, siap belajar hal baru"

3. Pengalaman Kerja
Format per posisi:
Nama Perusahaan, Kota
Posisi/Jabatan | Bulan/Tahun sampai Bulan/Tahun

- Poin 1: Pencapaian terkuat dengan angka
- Poin 2: Technical accomplishment dengan tools
- Poin 3: Kolaborasi atau kepemimpinan
- Poin 4: Impact atau scope tambahan

Contoh bullet point:
Baik: "Mengembangkan REST API menggunakan Python dan FastAPI, melayani 100K+ request harian dengan 99.9% uptime"
Baik: "Memimpin tim 8 engineer dalam membangun platform e-commerce, meningkatkan revenue 45% dalam 6 bulan"
Kurang baik: "Bertanggung jawab untuk membuat API"
Lemah: "Membantu pengembangan aplikasi"

4. Pendidikan
- Nama institusi dan lokasi
- Jurusan/program studi
- Tahun lulus atau prediksi lulus
- IPK (jika di atas 3.5/4.0)
- Mata kuliah relevan (jika fresh graduate)

5. Keahlian (Skills)
Kelompokkan berdasarkan kategori:

KETERAMPILAN TEKNIS
- Bahasa Pemrograman: Python, JavaScript, TypeScript, SQL
- Framework: React, Django, FastAPI, Express.js
- Cloud dan Infrastruktur: AWS, Docker, Kubernetes
- Database: PostgreSQL, MongoDB, Redis

KETERAMPILAN LUNAK
- Kepemimpinan tim, Manajemen proyek, Komunikasi presentasi

Kata Kerja Aksi Bahasa Indonesia

Kepemimpinan: Memimpin, Mengelola, Mengarahkan, Mengoordinasikan, Menyelaraskan
Penciptaan: Mengembangkan, Merancang, Membangun, Menciptakan, Meluncurkan
Peningkatan: Mengoptimalkan, Meningkatkan, Mempercepat, Menyempurnakan, Memperbaiki
Analisis: Menganalisis, Mengevaluasi, Menilai, Mengidentifikasi, Mengukur
Komunikasi: Mempresentasikan, Menegosiasikan, Menyampaikan, Merumuskan, Mendokumentasikan

Tips untuk Pasar Kerja Indonesia

1. Gunakan Bahasa Indonesia yang baik dan benar, bukan bahasa gaul
2. Untuk perusahaan multinasional, gunakan Bahasa Inggris
3. Cantumkan pengalaman organisasi jika relevan (khusus fresh graduate)
4. Sertakan sertifikasi profesional (BNSP, AWS, Google, dll)
5. Portofolio online sangat membantu (GitHub, personal website, Behance)
6. Sesuaikan CV untuk setiap lamaran, jangan kirim CV yang sama ke semua perusahaan
7. Format PDF lebih profesional dari DOCX
8. Panjang CV ideal: 1-2 halaman

Kesalahan Umum CV di Indonesia

1. Terlalu panjang (lebih dari 3 halaman)
2. Memasukkan foto kecuali diminta
3. Mencantumkan data sensitif (agama, status, tinggi/berat badan)
4. Menggunakan email tidak profesional
5. Menggunakan template yang terlalu dekoratif
6. Menyalin deskripsi pekerjaan tanpa pencapaian
7. Tidak menyesuaikan CV dengan posisi yang dilamar
8. Typo dan kesalahan tata bahasa""",
    },
]


URL_SOURCES = [
    {
        "url": "https://capd.mit.edu/resources/career-toolkit-crafting-an-effective-resume/",
        "source": "mit_career_handbook",
        "section_type": "technical_resume",
    },
    {
        "url": "https://careercenter.ucdavis.edu/resumes-and-materials/resumes",
        "source": "ucdavis_career_center",
        "section_type": "education_tips",
    },
    {
        "url": "https://www.indeed.com/career-advice/resumes-cover-letters/how-to-quantify-resume",
        "source": "indeed_quantify_guide",
        "section_type": "achievement_metrics",
    },
    {
        "url": "https://www.indeed.com/career-advice/resumes-cover-letters/action-verbs-to-make-your-resume-stand-out",
        "source": "indeed_action_verbs",
        "section_type": "experience",
    },
    {
        "url": "https://resumeworded.com/resume-bullet-points",
        "source": "resumeworded_bullet_tips",
        "section_type": "experience",
    },
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch_text(url: str) -> str:
    import re

    try:
        logger.info("seed_fetching_url", url=url)
        response = requests.get(url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        html = response.text

        html = re.sub(
            r"<script[^>]*>.*?</script>", "", html, flags=re.IGNORECASE | re.DOTALL
        )
        html = re.sub(
            r"<style[^>]*>.*?</style>", "", html, flags=re.IGNORECASE | re.DOTALL
        )
        html = re.sub(
            r"<noscript[^>]*>.*?</noscript>", "", html, flags=re.IGNORECASE | re.DOTALL
        )
        html = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)
        html = re.sub(r"<[^>]+>", " ", html)

        html = (
            html.replace("&nbsp;", " ")
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", '"')
            .replace("&#39;", "'")
        )

        html = re.sub(r"\s+", " ", html).strip()

        if len(html) < 500:
            return ""
        if sum(1 for c in html if c in "{}[]();=<>\"'\\/") / max(len(html), 1) > 0.2:
            return ""

        logger.info("seed_url_extracted", url=url, chars=len(html))
        return html
    except Exception as e:
        logger.warning("seed_fetch_failed", url=url, error=str(e))
        return ""


async def _store_chunks(
    chunks: list[str],
    source: str,
    section_type: str | None,
) -> int:
    stored = 0
    for i, chunk in enumerate(chunks):
        try:
            embedding = get_rag_embedding(chunk)
            async with async_session_maker() as session:
                knowledge_chunk = KnowledgeChunk(
                    content=chunk,
                    source=source,
                    section_type=section_type,
                    embedding=embedding,
                )
                session.add(knowledge_chunk)
                await session.commit()
            stored += 1
            if (i + 1) % 10 == 0:
                logger.info(
                    "seed_progress", source=source, stored=i + 1, total=len(chunks)
                )
            time.sleep(0.1)
        except Exception as e:
            logger.error("seed_chunk_error", source=source, chunk_idx=i, error=str(e))
    return stored


async def seed() -> None:
    logger.info("seed_starting")

    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT source, COUNT(*) FROM knowledge_chunks GROUP BY source")
        )
        existing = dict(result.fetchall())

    if existing:
        logger.info("seed_existing_chunks", sources=dict(existing))

    total_chunks = 0
    skipped_sources = set(existing.keys())

    logger.info("seed_processing_hardcoded")
    for item in HARDCODED_KNOWLEDGE:
        source = item["source"]
        if source in skipped_sources:
            logger.info("seed_skipping_exists", source=source)
            continue

        logger.info("seed_processing", source=source)
        content = item["content"].strip()
        chunks = chunk_text(content)
        logger.info("seed_chunked", source=source, chunks=len(chunks))

        stored = await _store_chunks(chunks, source, item.get("section_type"))
        total_chunks += stored

    logger.info("seed_processing_urls")
    for source_info in URL_SOURCES:
        url = source_info["url"]
        source = source_info["source"]

        if source in skipped_sources:
            logger.info("seed_skipping_exists", source=source)
            continue

        logger.info("seed_fetching", source=source)
        page_text = fetch_text(url)

        if not page_text:
            logger.warning("seed_no_text", source=source)
            continue

        chunks = chunk_text(page_text)
        logger.info("seed_url_chunked", source=source, chunks=len(chunks))

        stored = await _store_chunks(chunks, source, source_info.get("section_type"))
        total_chunks += stored

    async with async_session_maker() as session:
        result = await session.execute(
            text(
                "SELECT source, COUNT(*) FROM knowledge_chunks GROUP BY source ORDER BY source"
            )
        )
        final = dict(result.fetchall())

    logger.info("seed_complete", total_new=total_chunks, sources=dict(final))


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed())
