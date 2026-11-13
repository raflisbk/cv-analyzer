import argparse
import json
from pathlib import Path

DIMS = ("impact", "clarity", "relevance", "completeness")


def compare(before: dict, after: dict, max_mean_delta: float) -> tuple[dict, bool]:
    before_cases = before["cases"]
    after_cases = after["cases"]
    if before_cases.keys() != after_cases.keys():
        raise ValueError("Case IDs differ between runs")
    deltas = {
        case_id: {
            dim: after_cases[case_id]["scores"][dim] - old["scores"][dim]
            for dim in (*DIMS, "overall")
        }
        for case_id, old in before_cases.items()
    }
    means = {
        dim: sum(abs(row[dim]) for row in deltas.values()) / len(deltas) for dim in DIMS
    }
    strong = [
        case["scores"]["overall"]
        for case in after_cases.values()
        if case["group"] == "strong"
    ]
    weak = [
        case["scores"]["overall"]
        for case in after_cases.values()
        if case["group"] == "weak"
    ]
    passed = all(mean <= max_mean_delta for mean in means.values()) and min(
        strong
    ) > max(weak)
    return {"deltas": deltas, "mean_absolute_difference": means}, passed


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare two scoring golden runs")
    parser.add_argument("before", type=Path)
    parser.add_argument("after", type=Path)
    parser.add_argument("--max-mean-delta", type=float, default=7)
    args = parser.parse_args()
    if args.max_mean_delta < 0:
        parser.error("--max-mean-delta must be nonnegative")
    before = json.loads(args.before.read_text())
    after = json.loads(args.after.read_text())
    result, passed = compare(before, after, args.max_mean_delta)
    print("case                  impact clarity relevance completeness overall")
    for case_id, row in result["deltas"].items():
        print(
            f"{case_id:22} {row['impact']:+6} {row['clarity']:+7} {row['relevance']:+9} {row['completeness']:+12} {row['overall']:+7}"
        )
    print("mean absolute difference:", result["mean_absolute_difference"])
    print("PASS" if passed else "FAIL")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
