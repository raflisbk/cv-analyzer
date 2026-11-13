# Scoring golden set

Twelve fictional plain text CVs cover six Indonesian and six English examples. The `weak`, `average`, `strong`, and `edge` groups are labels for review, not inputs to the scorer. Contacts use reserved example domains and fictional names and employers.

## Labelling rubric

Bands follow the v6 prompt: 0–40 poor, 41–60 below average, 61–75 average, 76–85 good, 86–100 excellent. Impact rewards evidenced outcomes and scale, clarity rewards readable sections and concise bullets, relevance rewards role matching experience and skills, and completeness rewards contact, summary, dated experience, education and skills. Overall bands use the scorer's 35/30/20/15 weighting. Each dimension has roughly 20–30 points of tolerance for model variance; the strong versus weak ordering is a separate invariant. The short edge case should score low for completeness; the stuffed edge case has many terms but little evidence of work. These are synthetic rubric judgments, not scores from a reference model.

`expected_deterministic` labels cover exact detected section types, an expected verbatim skill list, and ranges for quantified bullet share, passive sentence count and ATS fail/warn checks. They test deterministic signals separately from model judgment.

## Run and review

From `backend/`, run `python -m pytest tests/golden` for the CI layer. With a real LLM key configured outside this repository, run `RUN_GOLDEN=1 python -m pytest tests/golden/test_golden_llm.py -s` before and after a scoring change. Preserve each generated `tests/golden/last_run.json` separately, then run `python scripts/golden_compare.py before.json after.json`. A failed comparison needs review of case deltas and labels before accepting the change. The LLM run is opt-in and must not run in CI.

If the scoring prompt or weights change, run the golden set, bump `SCORING_VERSION`, then run `python scripts/golden_fingerprint.py`. Commit the updated fingerprint with the scoring change. The guard requires the version and fingerprint to move together.
