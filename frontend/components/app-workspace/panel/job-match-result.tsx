import type { JobMatchData } from "@/lib/app-api/jobmatch.types";
import { ScoreBar } from "../score-bar";
import { MatchRing } from "./match-ring";
import { JobMatchRequirements } from "./job-match-requirements";
import { JobMatchActions } from "./job-match-actions";
import styles from "../workspace-styles";

export function JobMatchResult({
  result,
  onAdd,
  openFixes,
}: {
  result: JobMatchData;
  onAdd: (skill: string) => boolean;
  openFixes: () => void;
}) {
  return (
    <div className={styles.pane}>
      <div className={styles.row}>
        <MatchRing score={result.score} />
        <div>
          <h3>{result.headline}</h3>
          <p>{result.summary}</p>
        </div>
      </div>
      {result.dimensions.map((dimension) => (
        <ScoreBar
          key={dimension.key}
          label={dimension.key}
          score={dimension.score}
        />
      ))}
      <JobMatchRequirements requirements={result.requirements} onAdd={onAdd} />
      <JobMatchActions openFixes={openFixes} />
    </div>
  );
}
