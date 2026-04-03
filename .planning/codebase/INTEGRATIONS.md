# External Integrations

**Analysis Date:** 2026-04-03

## APIs & External Services

**AI/LLM Services:**
- Anthropic Claude - Primary AI model integration
  - SDK: anthropic>=0.39.0
  - Protocol: MCP (Model Context Protocol)
  - Authentication: API keys (env-based)

**Development Platforms:**
- GitHub - Skill repository hosting
  - Sources: Multiple GitHub repositories (anthropics/skills, mindrally/skills, wshobson/agents, etc.)
  - Integration: Skills dependency management

**Image Processing:**
- PIL/Pillow - Local image processing
  - SDK: pillow>=10.0.0
  - Usage: Image manipulation and generation

**Media Processing:**
- ImageIO - Image and video processing
  - SDK: imageio>=2.31.0, imageio-ffmpeg>=0.4.9
  - Usage: Video processing and image format conversion

## Data Storage

**Databases:**
- SQLite - Local database storage
  - Location: *.db, *.sqlite files
  - Connection: File-based

**File Storage:**
- Local filesystem - Primary storage
  - Location: data/ directories
  - Structure: Raw/intermediate/processed data organization

**Caching:**
- Local cache directories
  - Location: cache/ folders
  - Management: Manual cleanup

## Authentication & Identity

**Auth Provider:**
- Custom authentication - Environment-based
  - Implementation: API keys and credentials
  - Storage: .env files (excluded from git)

**Access Control:**
- Skill-level permissions - Built into skill framework
  - Implementation: Skill isolation and management

## Monitoring & Observability

**Error Tracking:**
- Local logging - File-based logging
  - Location: logs/ directories
  - Format: Standard log files

**Logs:**
- Python logging - Built-in logging framework
  - Location: *.log files
  - Management: Manual cleanup

## CI/CD & Deployment

**Hosting:**
- Local development - Direct file execution
- GitHub repositories - Skill hosting

**CI Pipeline:**
- GitHub Actions - Implicit through GitHub integration
- Skill management - Custom deployment process

## Environment Configuration

**Required env vars:**
- ANTHROPIC_API_KEY - Anthropic API access
- Various API keys - Multiple service integrations
- Virtual environment setup - Python dependencies

**Secrets location:**
- .env files - Local environment configuration
- .env.* patterns - Environment-specific configurations

## Webhooks & Callbacks

**Incoming:**
- Skill endpoints - Custom skill execution
- MCP protocol - Model Context Protocol communication

**Outgoing:**
- API calls - External service integration
- GitHub repository access - Skill management

---

*Integration audit: 2026-04-03*