"""
Prometheus metrics for LLM token tracking per LLM-06, D-16.
Counter defined at module level — instantiate ONCE, import the instance.
"""

from prometheus_client import Counter


llm_tokens_counter = Counter(
    "cv_analyzer_llm_tokens_total",
    "Total LLM tokens consumed for CV analysis",
    [
        "provider",
        "model",
        "type",
    ],  # labels: provider=openai, model=gpt-4o-mini, type=prompt|completion
)
