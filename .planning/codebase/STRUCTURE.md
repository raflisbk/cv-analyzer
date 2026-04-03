# Codebase Structure

**Analysis Date:** 2026-04-03

## Directory Layout

```
cv-analyzer/
├── .agents/                      # Skills organization system
│   └── skills/                   # Individual skill directories
│       ├── accessibility-a11y/   # Web accessibility best practices
│       ├── accessibility-compliance/ # WCAG compliance guidelines
│       ├── agent-governance/     # Agent management and governance
│       ├── agentic-eval/         # Agent evaluation frameworks
│       ├── ai-prompt-engineering-safety-review/ # Prompt engineering safety
│       ├── airflow-dag-patterns/ # Apache Airflow DAG patterns
│       ├── algorithmic-art/     # Algorithmic art generation
│       ├── alpine-js/           # Alpine.js framework guidance
│       ├── analytics-data-analysis/ # Data analysis patterns
│       ├── android-development/  # Android development guidance
│       ├── angular/             # Angular framework patterns
│       ├── angular-development/ # Angular development best practices
│       ├── anime-js/            # Anime.js animation library
│       ├── anthropic-claude-development/ # Claude API development
│       ├── anti-reversing-techniques/ # Security anti-reversing
│       ├── api-design-principles/ # API design patterns
│       ├── api-development/      # General API development
│       ├── apollo-graphql/      # Apollo GraphQL patterns
│       ├── appinsights-instrumentation/ # Azure Application Insights
│       ├── architecture-blueprint-generator/ # Architecture generation
│       ├── architecture-decision-records/ # Architecture decision records
│       ├── architecture-patterns/ # Clean Architecture, DDD, Hexagonal
│       ├── aspnet-core/         # ASP.NET Core patterns
│       ├── astro/               # Astro framework guidance
│       ├── async-python-patterns/ # Async Python patterns
│       ├── atlas-stream-processing/ # Stream processing patterns
│       ├── attack-tree-construction/ # Security attack trees
│       ├── auth-implementation-patterns/ # Authentication patterns
│       ├── auth0-authentication/ # Auth0 integration patterns
│       ├── autogen-development/ # AutoGen framework development
│       ├── automate-this/       # Automation patterns
│       ├── autoresearch/        # Research automation
│       ├── aws-cdk-python-setup/ # AWS CDK Python setup
│       ├── aws-development/     # AWS development patterns
│       ├── az-cost-optimize/    # Azure cost optimization
│       ├── azure/               # Azure service patterns
│       ├── azure-architecture-autopilot/ # Azure architecture automation
│       └── [100+ other skills]...
├── .planning/                    # Project planning and analysis
│   └── codebase/                # Codebase analysis documents
│       ├── ARCHITECTURE.md      # Architecture analysis
│       └── STRUCTURE.md        # Structure analysis
├── .gitattributes               # Git attributes configuration
├── .gitignore                  # Git ignore rules
├── LICENSE                     # MIT License
└── skills-lock.json            # Skill dependency registry
```

## Directory Purposes

**.agents/skills/:**
- Purpose: Primary skill organization and storage
- Contains: Individual skill directories with complete documentation
- Key files: Each skill contains SKILL.md, references/, scripts/, templates/

**.planning/codebase/:**
- Purpose: Project analysis and documentation
- Contains: Architecture and structure analysis documents
- Key files: ARCHITECTURE.md, STRUCTURE.md for project understanding

**Root Directory:**
- Purpose: Project-level configuration and management
- Contains: License, lockfile, git configuration
- Key files: LICENSE, skills-lock.json, .gitignore, .gitattributes

## Key File Locations

**Entry Points:**
- `[skills-lock.json]`: Dependency management for skills ecosystem
- `[.agents/skills/*/SKILL.md]`: Individual skill definitions and usage patterns
- `[.agents/scripts/*]`: Implementation scripts and generators

**Configuration:**
- `[LICENSE]`: MIT license for project usage
- `[.gitignore]`: Git ignore rules for version control
- `[.gitattributes]`: Git attributes for consistent behavior

**Core Logic:**
- `[.agents/skills/*/SKILL.md]`: Skill definitions and guidance
- `[.agents/skills/*/references/]`: Detailed patterns and examples
- `[.agents/skills/*/scripts/]]: Implementation automation

**Testing:**
- No dedicated testing directory detected - skills are tested through GitHub Copilot integration

## Naming Conventions

**Files:**
- `SKILL.md`: Primary skill documentation file
- `README.md`: Additional project documentation
- `*.json`: Configuration and lockfile data
- `*.md`: Documentation and reference materials

**Directories:**
- `[skill-name]/`: Lowercase with hyphens for skill names
- `references/`: Reference materials and detailed guidance
- `scripts/`: Implementation scripts and automation
- `templates/`: Code templates and boilerplate structures
- `assets/`: Additional assets and resources

## Where to Add New Code

**New Skill:**
- Primary code: `[.agents/skills/new-skill/SKILL.md]`
- References: `[.agents/skills/new-skill/references/]`
- Scripts: `[.agents/skills/new-skill/scripts/]`
- Templates: `[.agents/skills/new-skill/templates/]`

**Skill Enhancement:**
- Documentation: Update `[SKILL.md]` with new patterns
- References: Add detailed guidance to `[references/]`
- Implementation: Add scripts to `[scripts/]` for automation
- Templates: Add reusable code structures to `[templates/]`

**Global Configuration:**
- Dependencies: Update `[skills-lock.json]` with new skill references
- Project: Update root level files for project-level changes

## Special Directories

**.agents/skills/:**
- Purpose: Complete skill ecosystem organization
- Generated: No - manually organized skill directories
- Committed: Yes - contains all skill definitions and materials

**.planning/codebase/:**
- Purpose: Project analysis documentation
- Generated: Yes - automatically generated analysis documents
- Committed: Yes - provides project understanding and context

**scripts/ within skills:**
- Purpose: Implementation automation and code generation
- Generated: No - contains implementation logic
- Committed: Yes - provides executable functionality for skills

---

*Structure analysis: 2026-04-03*