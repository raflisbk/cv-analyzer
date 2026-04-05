# Coding Conventions

**Analysis Date:** 2026-04-03

## Naming Patterns

**Files:**
- Snake_case for all Python files
- Descriptive names that clearly indicate purpose
- No camelCase or PascalCase observed

**Functions:**
- Snake_case function names
- Private functions use single underscore prefix (e.g., `_setup_libreoffice_macro`)
- Clear, descriptive names that follow Python naming conventions

**Variables:**
- Snake_case variable names
- Meaningful names that describe content/purpose
- No abbreviated names observed in analyzed code

**Classes:**
- PascalCase (CamelCase with first letter uppercase)
- Clear, descriptive names
- Follow Python class naming conventions

**Methods:**
- Snake_case method names
- Public methods follow function naming conventions
- Private methods use underscore prefix

## Code Style

**Formatting:**
- No explicit formatting configuration found
- Consistent indentation observed in code samples
- Line lengths vary, suggesting no strict line length limits

**Linting:**
- No dedicated linter configuration files found
- Ruff cache directory listed in .gitignore suggests potential Ruff usage
- MyPy cache directory listed in .gitignore suggests potential type checking

**Type Hints:**
- Extensive use of type hints in modern code
- Union types using `|` syntax (e.g., `str | Path`)
- Generic types used (e.g., `list[str]`, `dict[str, Any]`)
- Optional types with proper typing

## Import Organization

**Order:**
- Standard library imports first
- Third-party imports second
- Local imports third
- Blank lines between groups

**Path Aliases:**
- No path alias configuration found
- Relative imports used within packages
- Absolute imports from external packages

**Import Patterns:**
```python
# Standard library
import argparse
import json
import sys
from pathlib import Path

# Third-party
from PIL import Image
import imageio.v3 as imageio
import numpy as np
from mcp import ClientSession, StdioServerParameters

# Local (when present)
from office.soffice import get_soffice_env
```

## Error Handling

**Patterns:**
- Try-except blocks with specific exception handling
- Functions return tuple[None, str] for error reporting
- Clear error messages with context
- Proper exception chaining where appropriate

**Examples:**
```python
try:
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30, check=False)
except subprocess.TimeoutExpired:
    return None, f"Operation timed out: {operation}"
```

## Logging

**Framework:** Standard `logging` module

**Patterns:**
- Logger instance per module
- Proper logging level usage
- Error messages use logger.error()
- Informative messages use logger.info()

**Example:**
```python
import logging

logger = logging.getLogger(__name__)

# Usage
logger.warning(f"Failed to setup LibreOffice macro: {e}")
```

## Comments

**When to Comment:**
- Complex algorithms and business logic
- API documentation for public interfaces
- Important implementation details
- Configuration and setup explanations

**Docstrings:**
- Comprehensive docstrings for classes and public methods
- Args and Returns sections present
- Clear descriptions of purpose

**Example:**
```python
"""Accept all tracked changes in a DOCX file using LibreOffice.

Requires LibreOffice (soffice) to be installed.
"""

def accept_changes(
    input_file: str,
    output_file: str,
) -> tuple[None, str]:
    """
    Accept all tracked changes in a DOCX file.

    Args:
        input_file: Path to input DOCX file with tracked changes
        output_file: Path to output DOCX file (clean, no tracked changes)

    Returns:
        Tuple of (None, success_message) or (error, None)
    """
```

## Function Design

**Size:**
- Generally moderate function sizes
- Clear separation of concerns
- Functions focused on single responsibility

**Parameters:**
- Parameters clearly typed
- Optional parameters with defaults
- No excessive parameter counts observed

**Return Values:**
- Clear return types
- Consistent error handling patterns
- Optional returns using `Optional` types

## Module Design

**Exports:**
- Clear public interface design
- Private functions properly underscored
- Classes as primary export units

**Barrel Files:**
- `__init__.py` files used for package structure
- No complex barrel file patterns observed

**Package Organization:**
- Skill-based directory structure
- Clear separation of concerns per skill
- Helper modules appropriately organized

## Configuration Management

**Environment:**
- Configuration through environment variables where needed
- No global configuration files found
- Per-skill requirements management

**Type Safety:**
- Extensive type hints in modern code
- Dataclass usage for structured data
- Proper typing for all public interfaces

## Testing Patterns

**Testing Framework:**
- No dedicated test framework configuration found
- No test files detected in codebase
- Manual verification and testing methods observed

**Code Quality:**
- Good separation of concerns
- Proper error handling patterns
- Clear documentation
- Type hints where appropriate

---

*Convention analysis: 2026-04-03*