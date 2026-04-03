# Technology Stack

**Analysis Date:** 2026-04-03

## Languages

**Primary:**
- Python 3.x - Throughout the codebase, primarily used in skill scripts and agents
- JavaScript - Used in some skill templates and frontend components
- TypeScript - Used in some skill implementations and SDKs

**Secondary:**
- JSON - Configuration and data serialization
- Markdown - Documentation

## Runtime

**Environment:**
- Python 3.x runtime
- Node.js runtime (for JavaScript/TypeScript components)

**Package Manager:**
- pip (Python) - Used in requirements.txt files
- npm (Node.js) - Referenced in configuration

**Lockfile:**
- skills-lock.json - Present, manages skill dependencies

## Frameworks

**Core:**
- Anthropic Claude Skills Framework - Primary framework for agent skills
- MCP (Model Context Protocol) - Used for protocol communication
- Custom agent architecture - Throughout the codebase

**Testing:**
- pytest - Referenced in gitignore
- unittest - Python standard library testing

**Build/Dev:**
- Python setuptools - Package management
- Git - Version control

## Key Dependencies

**Critical:**
- anthropic>=0.39.0 - Anthropic AI client library
- mcp>=1.1.0 - Model Context Protocol implementation
- pillow>=10.0.0 - Image processing (for mcp-builder skill)
- imageio>=2.31.0 - Image I/O operations
- imageio-ffmpeg>=0.4.9 - Video processing
- numpy>=1.24.0 - Numerical computing

**Infrastructure:**
- Custom skill management system - Based on skills-lock.json
- GitHub integration - Multiple skill sources

## Configuration

**Environment:**
- .env files present (excluded from git)
- Multiple .env.* patterns for different environments
- Python virtual environment support

**Build:**
- Python egg/wheel packaging
- Node.js module management
- Skills lock file for dependency management

## Platform Requirements

**Development:**
- Python 3.x environment
- Node.js environment
- Git for version control
- Virtual environment support

**Production:**
- Python runtime
- Agent execution environment
- Skill deployment infrastructure

---

*Stack analysis: 2026-04-03*