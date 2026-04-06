"""
Text chunking helper for RAG knowledge base seeding per D-12.
Splits text into overlapping chunks (~500 chars, 50-char overlap).
"""


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[str]:
    """
    Split text into overlapping character-based chunks.

    Args:
        text: Source text to chunk.
        chunk_size: Target chunk size in characters (approx 125 tokens at 4 chars/token).
        overlap: Overlap between consecutive chunks in characters.

    Returns:
        List of text chunks. Empty list if text is empty.
    """
    if not text or not text.strip():
        return []

    text = text.strip()
    chunks: list[str] = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = end - overlap  # overlap ensures context continuity

    return chunks
