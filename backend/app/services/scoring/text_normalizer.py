"""Normalize PDF-extracted CV text before sending to LLM.

PDF parsers (PyMuPDF, pdfplumber) often produce:
- Broken hyphenation across lines ("collabor-\nating" → "collaborating")
- Multiple consecutive spaces from column layouts
- Stray mid-sentence newlines where a line wraps at a narrow column width
- Excessive blank lines between sections

These artifacts cause LLMs to perceive the CV as poorly formatted when the
original PDF may be well-designed. Normalize before scoring to avoid
penalizing candidates for parser noise.
"""

import re


def normalize_cv_text(text: str) -> str:
    # Fix broken hyphenation: "word-\nword" → "wordword"
    text = re.sub(r"-\n(\S)", r"\1", text)

    # Stray mid-sentence line break: letter/comma then newline then lowercase
    # "achieving 98% ac-\ncuracy" → already handled above; catch remaining cases
    text = re.sub(r"([A-Za-z,;])\n([a-z])", r"\1 \2", text)

    # Collapse runs of spaces/tabs (from multi-column layout) to single space
    text = re.sub(r"[ \t]{2,}", " ", text)

    # Trim trailing whitespace on each line
    text = "\n".join(line.rstrip() for line in text.splitlines())

    # Collapse 3+ consecutive blank lines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()
