<!-- GSD:project-start source:PROJECT.md -->
## Project

**CV Analyzer**

A web-based CV/resume analyzer application that provides multi-dimensional scoring, improvement suggestions, and job role comparison. Built as a portfolio project to demonstrate AI Engineer mastery through production-ready architecture and modern AI capabilities.

Users upload CV files (PDF/DOC), receive comprehensive analysis including completeness scores, impact metrics, skill gaps, and actionable improvement recommendations. The application also compares CVs against job descriptions to identify matching strengths and weaknesses.

**Core Value:** **Demonstrate AI Engineer mastery** — Every technical decision prioritizes showcasing deep understanding of modern AI engineering, from LLM integration and RAG architecture to production deployment and real-time streaming.

### Constraints

- **Budget**: Use free-tier cloud services (Vercel, Railway, Cloudflare R2) — minimize costs
- **Timeline**: Portfolio project — no hard deadline, quality over speed
- **Tech Stack**: Python (FastAPI) + Next.js + PostgreSQL with pgvector
- **LLM Access**: Has API keys available (Claude/OpenAI)
- **Deployment**: Must be live production URL for portfolio sharing
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- Python 3.x - Throughout the codebase, primarily used in skill scripts and agents
- JavaScript - Used in some skill templates and frontend components
- TypeScript - Used in some skill implementations and SDKs
- JSON - Configuration and data serialization
- Markdown - Documentation
## Runtime
- Python 3.x runtime
- Node.js runtime (for JavaScript/TypeScript components)
- pip (Python) - Used in requirements.txt files
- npm (Node.js) - Referenced in configuration
- skills-lock.json - Present, manages skill dependencies
## Frameworks
- Anthropic Claude Skills Framework - Primary framework for agent skills
- MCP (Model Context Protocol) - Used for protocol communication
- Custom agent architecture - Throughout the codebase
- pytest - Referenced in gitignore
- unittest - Python standard library testing
- Python setuptools - Package management
- Git - Version control
## Key Dependencies
- anthropic>=0.39.0 - Anthropic AI client library
- mcp>=1.1.0 - Model Context Protocol implementation
- pillow>=10.0.0 - Image processing (for mcp-builder skill)
- imageio>=2.31.0 - Image I/O operations
- imageio-ffmpeg>=0.4.9 - Video processing
- numpy>=1.24.0 - Numerical computing
- Custom skill management system - Based on skills-lock.json
- GitHub integration - Multiple skill sources
## Configuration
- .env files present (excluded from git)
- Multiple .env.* patterns for different environments
- Python virtual environment support
- Python egg/wheel packaging
- Node.js module management
- Skills lock file for dependency management
## Platform Requirements
- Python 3.x environment
- Node.js environment
- Git for version control
- Virtual environment support
- Python runtime
- Agent execution environment
- Skill deployment infrastructure
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Snake_case for all Python files
- Descriptive names that clearly indicate purpose
- No camelCase or PascalCase observed
- Snake_case function names
- Private functions use single underscore prefix (e.g., `_setup_libreoffice_macro`)
- Clear, descriptive names that follow Python naming conventions
- Snake_case variable names
- Meaningful names that describe content/purpose
- No abbreviated names observed in analyzed code
- PascalCase (CamelCase with first letter uppercase)
- Clear, descriptive names
- Follow Python class naming conventions
- Snake_case method names
- Public methods follow function naming conventions
- Private methods use underscore prefix
## Code Style
- No explicit formatting configuration found
- Consistent indentation observed in code samples
- Line lengths vary, suggesting no strict line length limits
- No dedicated linter configuration files found
- Ruff cache directory listed in .gitignore suggests potential Ruff usage
- MyPy cache directory listed in .gitignore suggests potential type checking
- Extensive use of type hints in modern code
- Union types using `|` syntax (e.g., `str | Path`)
- Generic types used (e.g., `list[str]`, `dict[str, Any]`)
- Optional types with proper typing
## Import Organization
- Standard library imports first
- Third-party imports second
- Local imports third
- Blank lines between groups
- No path alias configuration found
- Relative imports used within packages
- Absolute imports from external packages
## Error Handling
- Try-except blocks with specific exception handling
- Functions return tuple[None, str] for error reporting
- Clear error messages with context
- Proper exception chaining where appropriate
## Logging
- Logger instance per module
- Proper logging level usage
- Error messages use logger.error()
- Informative messages use logger.info()
## Comments
- Complex algorithms and business logic
- API documentation for public interfaces
- Important implementation details
- Configuration and setup explanations
- Comprehensive docstrings for classes and public methods
- Args and Returns sections present
- Clear descriptions of purpose
## Function Design
- Generally moderate function sizes
- Clear separation of concerns
- Functions focused on single responsibility
- Parameters clearly typed
- Optional parameters with defaults
- No excessive parameter counts observed
- Clear return types
- Consistent error handling patterns
- Optional returns using `Optional` types
## Module Design
- Clear public interface design
- Private functions properly underscored
- Classes as primary export units
- `__init__.py` files used for package structure
- No complex barrel file patterns observed
- Skill-based directory structure
- Clear separation of concerns per skill
- Helper modules appropriately organized
## Configuration Management
- Configuration through environment variables where needed
- No global configuration files found
- Per-skill requirements management
- Extensive type hints in modern code
- Dataclass usage for structured data
- Proper typing for all public interfaces
## Testing Patterns
- No dedicated test framework configuration found
- No test files detected in codebase
- Manual verification and testing methods observed
- Good separation of concerns
- Proper error handling patterns
- Clear documentation
- Type hints where appropriate
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Centralized skill management system for GitHub Copilot agents
- Modular skill organization with clear separation of concerns
- Skill lockfile for dependency management and versioning
- Documentation-driven approach with markdown-based skill definitions
- Multi-technology support across various domains (frontend, backend, DevOps, etc.)
## Layers
- Purpose: Project-level configuration and management
- Location: `./`
- Contains: License, skill lockfile, project configuration
- Depends on: Skills organization system
- Used by: Skill management and deployment
- Purpose: Categorization and management of individual skills
- Location: `./.agents/skills/`
- Contains: Individual skill directories with metadata
- Depends on: Root layer structure
- Used by: Skill discovery and selection
- Purpose: Encapsulated functionality for specific domains
- Location: `./.agents/skills/[skill-name]/`
- Contains: SKILL.md, references, templates, scripts
- Depends on: Skills organization structure
- Used by: GitHub Copilot agent execution
- Purpose: Actual code implementation and examples
- Location: `./.agents/skills/[skill-name]/scripts/`, `./.agents/skills/[skill-name]/templates/`
- Contains: Source code, templates, examples
- Depends on: Skill definition and references
- Used by: Direct execution by AI agents
## Data Flow
## Key Abstractions
- Purpose: Encapsulated domain-specific knowledge and patterns
- Examples: `[.agents/skills/accessibility-a11y/`, `.agents/skills/architecture-patterns/`, `.agents/skills/api-design-principles/`]
- Pattern: Self-contained directories with SKILL.md and supporting materials
- Purpose: Dependency management for skills ecosystem
- Examples: `[skills-lock.json]`
- Pattern: JSON-based registry of skill sources and versions
- Purpose: Detailed guidance and patterns beyond core skill definition
- Examples: `[.agents/skills/architecture-patterns/references/`, `.agents/skills/accessibility-compliance/references/`]
- Pattern: Organized markdown documentation domain-specific topics
- Purpose: Boilerplate code structures for common patterns
- Examples: `[.agents/skills/algorithmic-art/templates/`, `.agents/skills/api-design-principles/templates/`]
- Pattern: Reusable code structures with placeholders and examples
## Entry Points
- Location: Various skill directories via GitHub Copilot CLI
- Triggers: Natural language requests from developers
- Responsibilities: Route to appropriate skill based on request context
- Location: `[.agents/skills/[skill-name]/SKILL.md]`
- Triggers: Skill discovery and selection process
- Responsibilities: Provide skill description, usage patterns, and core guidance
- Location: `[.agents/skills/[skill-name]/scripts/]`
- Triggers: Skill implementation requirements
- Responsibilities: Generate code, diagrams, or provide automation
## Error Handling
- Skill-level error handling in SKILL.md with fallback patterns
- Reference materials provide troubleshooting guidance
- Script implementations include error recovery mechanisms
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
