from prometheus_client import Counter


llm_tokens_counter = Counter(
    "cv_analyzer_llm_tokens_total",
    "Total LLM tokens consumed for CV analysis",
    [
        "provider",
        "model",
        "type",
    ],
)
