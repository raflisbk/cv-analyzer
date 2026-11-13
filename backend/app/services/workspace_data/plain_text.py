from app.schemas.workspace_data import AtsLine, AtsPlainText

MAX_LINES = 200
RISK_CHARACTERS = set("•●◆▪▸►◦‣⁃\ufffd\u200b\u200c\u200d\ufeff")


def risky_character(char: str) -> bool:
    return char in RISK_CHARACTERS or "\ue000" <= char <= "\uf8ff"


def plain_text(text: str, hidden_snippets: list[str]) -> AtsPlainText:
    snippets = [snippet for snippet in hidden_snippets if snippet]
    lines = []
    for line in text.splitlines()[:MAX_LINES]:
        flagged = any(risky_character(char) for char in line) or any(
            snippet in line for snippet in snippets
        )
        lines.append(AtsLine(text=line, flagged=flagged))
    flagged_count = sum(line.flagged for line in lines)
    return AtsPlainText(
        lines=lines,
        note=f"{flagged_count} of {len(lines)} extracted lines may need parser review.",
    )
