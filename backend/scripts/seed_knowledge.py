"""
RAG knowledge base seed script per D-12, RAG-04.
Combines web scraping + hardcoded content for missing categories.

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

from app.db.session import async_session_maker
from app.models.knowledge_chunk import KnowledgeChunk
from app.services.rag.chunker import chunk_text
from app.services.rag.embeddings import get_rag_embedding


# Hardcoded content for missing categories
HARDCODED_KNOWLEDGE = [
    {
        "source": "skills_section_guide",
        "section_type": "skills_best_practice",
        "content": """
        How to Write the Skills Section of Your Resume

        Technical Skills (Hard Skills)
        Technical skills are specific, teachable abilities that can be defined and measured.
        Examples by category:

        Programming & Development:
        - Languages: Python, JavaScript, Java, C#, TypeScript, Go, Rust, PHP, Ruby
        - Frameworks: React, Angular, Vue, Django, Flask, Express, Spring, FastAPI
        - Databases: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch
        - Cloud: AWS, Azure, Google Cloud Platform, Heroku, Vercel
        - Tools: Git, Docker, Kubernetes, Jenkins, GitHub Actions, Jira
        - Data: SQL, pandas, NumPy, TensorFlow, PyTorch, Tableau, Power BI

        Design & Creative:
        - Design Tools: Figma, Adobe XD, Sketch, Photoshop, Illustrator
        - UI/UX: Wireframing, prototyping, user research, accessibility
        - Multimedia: Video editing, sound design, animation

        Soft Skills (People Skills)
        Soft skills are interpersonal attributes that characterize your relationship with other people.

        Communication Skills:
        - Written communication: Clear emails, reports, documentation
        - Verbal communication: Presentations, meetings, client interaction
        - Active listening: Understanding stakeholder needs

        Leadership & Management:
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
        8. Indicate proficiency level if helpful (e.g., "Fluent in Spanish")
        9. Include certifications alongside relevant skills
        10. Be honest about your skill level

        Skills to Avoid:
        - Generic phrases like "computer skills" or "hard worker"
        - Basic skills assumed for your profession
        - Skills unrelated to target job
        - Outdated technologies (unless specifically requested)
        - Vague skills without context

        Examples by Experience Level:

        Entry Level (Recent Graduate):
        Skills: Python, JavaScript, HTML/CSS, SQL, Git,
        React, Excel, PowerPoint, Spanish (conversational)

        Mid Level:
        Technical Skills: Python, JavaScript, TypeScript, React,
        Node.js, PostgreSQL, MongoDB, AWS, Docker, Git, CI/CD
        Soft Skills: Team leadership, Project management, Communication

        Senior Level:
        Technical Expertise: Cloud architecture, Microservices,
        System design, DevOps, Python, Go, Kubernetes, Terraform
        Leadership: Team building, Technical mentoring, Strategic planning,
        Stakeholder management, Cross-functional collaboration
        """,
    },
    {
        "source": "common_resume_mistakes",
        "section_type": "common_mistakes",
        "content": """
        Common Resume Mistakes to Avoid in 2025

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
        Impact: Doesn't show real impact or value
        Solution: Use specific numbers, percentages, and results

        Weak: "Increased sales"
        Strong: "Increased sales by 35% generating $500K in new revenue"

        Weak: "Managed a team"
        Strong: "Led team of 15 developers, achieving 120% of annual targets"

        6. Using Passive Language
        Problem: Weak phrases like "Responsible for", "Assisted with", "Helped"
        Impact: Doesn't show leadership or initiative
        Solution: Use strong action verbs

        Replace:
        - "Responsible for" → "Managed", "Led", "Developed"
        - "Assisted with" → "Contributed to", "Supported"
        - "Helped" → "Collaborated", "Facilitated"
        - "Worked on" → "Developed", "Implemented", "Created"

        7. Resume Too Long
        Problem: Exceeding 2 pages for most positions
        Impact: Recruiters won't read it all
        Solution: Keep it concise (1 page for entry-mid level, 2 max for senior)

        8. Not Tailoring to the Job
        Problem: One resume for all applications
        Impact: Doesn't match job requirements
        Solution: Customize for each position, use keywords from job description

        9. Including References
        Problem: "References available upon request"
        Impact: Wastes valuable space
        Solution: Remove entirely (employers ask if needed)

        10. Outdated Contact Information
        Problem: Wrong email, phone, or broken LinkedIn link
        Impact: Employers can't reach you
        Solution: Verify all contact info before submitting

        11. Using Personal Pronouns
        Problem: "I managed", "My responsibilities included"
        Impact: Unnecessary, wastes space
        Solution: Remove all "I", "me", "my" references

        12. Focusing on Duties Instead of Achievements
        Problem: Listing job responsibilities instead of accomplishments
        Impact: Doesn't differentiate you from others
        Solution: Focus on what you achieved, not just what you did

        13. Inconsistent Date Formats
        Problem: Mix of "01/2020", "Jan 2020", "2020"
        Impact: Unprofessional, confusing
        Solution: Use consistent format (MM/YYYY or "Month YYYY")

        14. Missing Key Keywords
        Problem: Not including terms from job description
        Impact: ATS systems may reject resume
        Solution: Incorporate relevant keywords naturally

        15. Using Unprofessional Email
        Problem: "partyboy123@email.com" or similar
        Impact: Creates poor impression
        Solution: Use professional email (name.lastname@email.com)

        Quick Checklist Before Submitting:
        ✓ Spell-checked and grammar-checked
        ✓ All contact information current
        ✓ Tailored to specific job
        ✓ Quantified achievements with numbers
        ✓ Strong action verbs throughout
        ✓ Consistent formatting
        ✓ Appropriate length (1-2 pages)
        ✓ No personal pronouns
        ✓ Keywords from job description included
        ✓ Saved as PDF unless requested otherwise
        """,
    },
    {
        "source": "ats_formatting_guide",
        "section_type": "formatting_ats",
        "content": """
        ATS-Friendly Resume Formatting Guide 2025

        What is an ATS?
        Applicant Tracking System (ATS) is software that filters and ranks resumes
        based on keywords, format, and criteria. Used by 75%+ of large companies.

        ATS-Friendly Formatting Rules

        1. Use Standard Section Headings
        Good: "Work Experience", "Education", "Skills", "Summary"
        Bad: "My Journey", "What I Learned", "Stuff I'm Good At"
        Why: ATS looks for standard headings to categorize information

        2. Choose Simple, ATS-Compatible Fonts
        Recommended Fonts:
        - Arial (most compatible)
        - Calibri
        - Helvetica
        - Times New Roman
        - Georgia
        - Verdana

        Avoid:
        - Decorative fonts
        - Custom/unusual fonts
        - Font sizes below 10pt

        3. Use Standard Reverse-Chronological Format
        Order:
        1. Header/Contact Info
        2. Professional Summary
        3. Work Experience (most recent first)
        4. Education
        5. Skills
        6. Optional: Certifications, Projects

        Why: ATS expects this standard structure

        4. Avoid Graphics, Images, and Tables
        Avoid:
        - Photos or logos
        - Charts and graphs
        - Text boxes
        - Tables and columns
        - Borders and shading
        - Headers and footers

        Why: ATS can't parse these elements correctly

        5. Use Standard Bullet Points
        Good: Standard round bullets (•)
        Bad: Arrows, checkmarks, custom symbols, emojis
        Why: Special characters may not parse correctly

        6. Include Relevant Keywords
        Strategies:
        - Use exact terms from job description
        - Include industry-standard terminology
        - Spell out abbreviations first: "Customer Relationship Management (CRM)"
        - Use both acronyms and full terms
        - Place keywords throughout resume, not just in skills section

        Examples:
        Job description says: "project management"
        Your resume: "Managed projects using Agile methodology"

        Job description says: "Python development"
        Your resume: "Developed applications using Python, Django, Flask"

        7. Optimize Contact Information
        Format:
        John Doe
        john.doe@email.com | (555) 123-4567 | LinkedIn Profile
        City, State (ZIP optional)

        Tips:
        - Use professional email
        - Include LinkedIn URL (clean profile URL)
        - Don't include full street address (city/state is enough)
        - Avoid special characters in phone numbers

        8. File Format and Naming
        Best: .docx (Word) or .pdf (if requested)
        File name: "FirstName_LastName_Resume.pdf"

        Avoid:
        - .doc (older Word format)
        - Unusual formats
        - Generic names like "resume.pdf"

        9. Date Format Consistency
        Good formats:
        - MM/YYYY (01/2020)
        - Month YYYY (January 2020)
        - Present (for current roles)

        Avoid:
        - Mix of formats
        - Just years (lose detail)
        - Ambiguous formats

        10. Experience Section Format
        For each role:

        Job Title | Company Name | City, State
        MM/YYYY – Present

        • Achievement with numbers (Start with action verb)
        • Another quantified accomplishment
        • Technical skills or tools used

        Example:
        Software Engineer | Tech Corp | San Francisco, CA
        01/2020 – Present

        • Developed microservices architecture reducing latency by 40%
        • Led team of 5 engineers to launch e-commerce platform
        • Implemented CI/CD pipeline reducing deployment time by 60%

        11. Skills Section Optimization
        Group skills by category:

        TECHNICAL SKILLS
        Languages: Python, JavaScript, SQL
        Frameworks: React, Django, FastAPI
        Cloud: AWS, Docker, Kubernetes
        Databases: PostgreSQL, MongoDB

        SOFT SKILLS
        Leadership, Communication, Project Management

        Why: Easier for ATS to parse and categorize

        12. What NOT to Include
        Avoid these ATS-blocking elements:
        - Multiple columns
        - Fancy borders or shading
        - Text boxes or shapes
        - Embedded images or logos
        - Non-standard section names
        - Excessive bold/italics/underlines
        - Creative file formats (.jpg, .png, .infographic)
        - Macros or special formatting
        - Headers/footers with page numbers

        13. Testing Your ATS Compatibility
        Before submitting:

        1. Copy resume text into plain text editor
           - Does formatting remain intact?
           - Are bullets and paragraphs clear?

        2. Use ATS scanning tools
           - Jobscan.co
           - Resume Worded
           - Indeed Resume Review

        3. Apply through company ATS if possible
           - Workday
           - Taleo
           - Greenhouse
           - Lever

        4. Check with text-only resume viewer
           - Save as .txt
           - Verify information is readable

        Quick ATS-Friendly Template:

        [Name]
        [Email] | [Phone] | [LinkedIn URL]
        [City, State]

        PROFESSIONAL SUMMARY
        [2-3 sentence summary with key qualifications and keywords]

        WORK EXPERIENCE

        [Job Title] | [Company] | [City, State]
        [MM/YYYY] – [Present/MM/YYYY]

        • [Achievement with metric]
        • [Another accomplishment]
        • [Skills used]

        [Repeat for each role]

        EDUCATION

        [Degree] | [Major]
        [University], [City, State]
        [Graduation Year]

        SKILLS

        Technical: [List 6-10 technical skills]
        Soft Skills: [List 4-6 soft skills]

        CERTIFICATIONS (optional)

        [Certification Name], [Year]
        """,
    },
]


# URL-based sources (web scraping)
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
        "url": "https://jsonresume.org/schema/",
        "source": "jsonresume_schema",
        "section_type": "structure_guide",
    },
    {
        "url": "https://www.indeed.com/career-advice/resumes-cover-letters/writing-a-resume-summary-with-examples",
        "source": "indeed_summary_guide",
        "section_type": "summary_best_practice",
    },
    {
        "url": "https://www.indeed.com/career-advice/resumes-cover-letters/action-verbs-to-make-your-resume-stand-out",
        "source": "indeed_action_verbs",
        "section_type": "experience",
    },
    {
        "url": "https://www.indeed.com/career-advice/resumes-cover-letters/how-to-quantify-resume",
        "source": "indeed_achieve_guide",
        "section_type": "achievement_metrics",
    },
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
}


def fetch_text(url: str) -> str:
    """Fetch URL and extract readable text."""
    import re

    try:
        print(f"    Fetching {url}...")
        response = requests.get(url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        html = response.text

        # Remove script/style tags
        html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.IGNORECASE | re.DOTALL)
        html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.IGNORECASE | re.DOTALL)
        html = re.sub(r"<noscript[^>]*>.*?</noscript>", "", html, flags=re.IGNORECASE | re.DOTALL)
        html = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)
        html = re.sub(r"<[^>]+>", " ", html)

        # Decode entities
        html = html.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').replace("&#39;", "'")

        # Clean whitespace
        html = re.sub(r"\s+", " ", html).strip()

        # Remove junk
        for pattern in [r"\bvar\s+\w+\s*=.*?;", r"\bfunction\s*\w*\s*\(.*?\)\s*\{.*?\}", r"\bconsole\.\w+\(.*?\);?", r"\bwindow\.\w+\s*=.*?;", r"https?://[^\s<>\"\']+\.(js|css|png|jpg|gif)", r"/\*.*?\*/", r"\{[^}]*\}"]:
            html = re.sub(pattern, "", html, flags=re.IGNORECASE | re.DOTALL)

        if len(html) < 500:
            return ""
        if sum(1 for c in html if c in "{}[]();=<>\"'\\/") / max(len(html), 1) > 0.2:
            return ""

        print(f"    Extracted {len(html)} characters")
        return html
    except Exception as e:
        print(f"    WARNING: Failed to fetch {url}: {e}")
        return ""


async def seed() -> None:
    """Main seed function: hardcoded → URL scrape → chunk → embed → store."""
    print("Starting RAG knowledge base seeding (hardcoded + URL sources)...")

    # Check existing
    async with async_session_maker() as session:
        result = await session.execute(text("SELECT source, COUNT(*) FROM knowledge_chunks GROUP BY source"))
        existing = dict(result.fetchall())

    if existing:
        print(f"\nExisting knowledge chunks:")
        for source, count in existing.items():
            print(f"  - {source}: {count} chunks")

    total_chunks = 0
    skipped_sources = set(existing.keys())

    # 1. Process hardcoded content first
    print("\n=== Processing Hardcoded Content ===")
    for item in HARDCODED_KNOWLEDGE:
        source = item["source"]
        if source in skipped_sources:
            print(f"\nSkipping {source} (already exists)")
            continue

        print(f"\nProcessing: {source}")
        content = item["content"].strip()
        chunks = chunk_text(content, chunk_size=500, overlap=50)
        print(f"  Chunked into {len(chunks)} segments")

        for i, chunk in enumerate(chunks):
            try:
                embedding = get_rag_embedding(chunk)
                async with async_session_maker() as session:
                    knowledge_chunk = KnowledgeChunk(
                        content=chunk,
                        source=source,
                        section_type=item.get("section_type"),
                        embedding=embedding,
                    )
                    session.add(knowledge_chunk)
                    await session.commit()
                total_chunks += 1
                if (i + 1) % 10 == 0:
                    print(f"  Stored {i + 1}/{len(chunks)} chunks...")
                time.sleep(0.1)
            except Exception as e:
                print(f"  ERROR on chunk {i}: {e}")

    # 2. Process URL sources
    print("\n=== Processing URL Sources ===")
    for source_info in URL_SOURCES:
        url = source_info["url"]
        source = source_info["source"]

        if source in skipped_sources:
            print(f"\nSkipping {source} (already exists)")
            continue

        print(f"\nFetching: {source}")
        page_text = fetch_text(url)

        if not page_text:
            print(f"  SKIPPED: No text extracted")
            continue

        chunks = chunk_text(page_text, chunk_size=500, overlap=50)
        print(f"  Chunked into {len(chunks)} segments")

        for i, chunk in enumerate(chunks):
            try:
                embedding = get_rag_embedding(chunk)
                async with async_session_maker() as session:
                    knowledge_chunk = KnowledgeChunk(
                        content=chunk,
                        source=source,
                        section_type=source_info.get("section_type"),
                        embedding=embedding,
                    )
                    session.add(knowledge_chunk)
                    await session.commit()
                total_chunks += 1
                if (i + 1) % 10 == 0:
                    print(f"  Stored {i + 1}/{len(chunks)} chunks...")
                time.sleep(0.1)
            except Exception as e:
                print(f"  ERROR on chunk {i}: {e}")

    print(f"\n=== Seeding Complete ===")
    print(f"Total chunks stored: {total_chunks}")

    # Final stats
    async with async_session_maker() as session:
        result = await session.execute(text("SELECT source, COUNT(*) FROM knowledge_chunks GROUP BY source ORDER BY source"))
        final = dict(result.fetchall())
        print(f"\nFinal knowledge base:")
        for source, count in final.items():
            print(f"  - {source}: {count} chunks")
        print(f"  TOTAL: {sum(final.values())} chunks")


if __name__ == "__main__":
    import asyncio
    import sys

    # Windows fix
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed())
