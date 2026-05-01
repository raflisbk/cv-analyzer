import re


_MIN_CHUNK_CHARS = 100
_MAX_CHUNK_CHARS = 800
_OVERLAP_SENTENCES = 1

_SENTENCE_ENDINGS = re.compile(r"(?<=[.!?])\s+")
_PARAGRAPH_BREAK = re.compile(r"\n\s*\n")
_LIST_ITEM = re.compile(r"(?<=\n)([-•*]|\d+[.)])\s+")


def chunk_text(
    text: str,
    max_chunk_size: int = _MAX_CHUNK_CHARS,
    min_chunk_size: int = _MIN_CHUNK_CHARS,
    overlap_sentences: int = _OVERLAP_SENTENCES,
) -> list[str]:
    if not text or not text.strip():
        return []

    text = text.strip()

    paragraphs = _PARAGRAPH_BREAK.split(text)
    paragraphs = [p.strip() for p in paragraphs if p.strip()]

    raw_chunks: list[str] = []
    current = ""

    for para in paragraphs:
        if not current:
            current = para
        elif len(current) + len(para) + 2 <= max_chunk_size:
            current = current + "\n\n" + para
        else:
            if current.strip():
                raw_chunks.append(current.strip())
            if overlap_sentences > 0 and raw_chunks:
                prev_tail = _tail_sentences(current, overlap_sentences)
                current = prev_tail + "\n\n" + para if prev_tail else para
            else:
                current = para

    if current.strip():
        raw_chunks.append(current.strip())

    chunks: list[str] = []
    for chunk in raw_chunks:
        if len(chunk) <= max_chunk_size:
            if len(chunk) >= min_chunk_size:
                chunks.append(chunk)
            elif chunks:
                chunks[-1] = chunks[-1] + "\n\n" + chunk
            else:
                chunks.append(chunk)
        else:
            chunks.extend(_split_long_chunk(chunk, max_chunk_size, min_chunk_size))

    return chunks


def _tail_sentences(text: str, count: int) -> str:
    sentences = _SENTENCE_ENDINGS.split(text)
    sentences = [s for s in sentences if s.strip()]
    if len(sentences) <= 1:
        return ""
    tail = sentences[-count:] if count < len(sentences) else sentences[:-1]
    return " ".join(tail)


def _split_long_chunk(text: str, max_size: int, min_size: int) -> list[str]:
    parts: list[str] = []
    lines = text.split("\n")

    current = ""
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            if current:
                current += "\n"
            continue

        if len(current) + len(line_stripped) + 1 <= max_size:
            current = current + "\n" + line_stripped if current else line_stripped
        else:
            if current and len(current) >= min_size:
                parts.append(current.strip())
            current = line_stripped

    if current and len(current) >= min_size:
        parts.append(current.strip())
    elif parts and current:
        parts[-1] = parts[-1] + "\n" + current.strip()

    still_long = [p for p in parts if len(p) > max_size]
    ok = [p for p in parts if len(p) <= max_size]

    for chunk in still_long:
        sentences = _SENTENCE_ENDINGS.split(chunk)
        sentences = [s for s in sentences if s.strip()]

        current = ""
        for sent in sentences:
            if len(current) + len(sent) + 1 <= max_size:
                current = current + " " + sent if current else sent
            else:
                if current:
                    ok.append(current.strip())
                current = sent
        if current:
            ok.append(current.strip())

    return [p for p in ok if len(p) >= min_size]
