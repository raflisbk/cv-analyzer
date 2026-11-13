from scripts.golden_compare import compare


def _run(strong: int, weak: int) -> dict:
    def case(group: str, score: int) -> dict:
        return {
            "group": group,
            "scores": {
                "impact": score,
                "clarity": score,
                "relevance": score,
                "completeness": score,
                "overall": score,
            },
        }

    return {"cases": {"strong": case("strong", strong), "weak": case("weak", weak)}}


def test_compare_passes_small_deltas() -> None:
    result, passed = compare(_run(80, 40), _run(76, 44), 7)
    assert passed
    assert result["mean_absolute_difference"]["impact"] == 4


def test_compare_fails_large_delta() -> None:
    _, passed = compare(_run(80, 40), _run(60, 40), 7)
    assert not passed


def test_compare_fails_reversed_order() -> None:
    _, passed = compare(_run(50, 48), _run(47, 51), 7)
    assert not passed
