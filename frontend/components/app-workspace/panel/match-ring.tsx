import styles from "../workspace-styles";

export function MatchRing({ score }: { score: number }) {
  return (
    <div className={styles.ring} role="img" aria-label={`${score}% job match`}>
      <svg viewBox="0 0 88 88" aria-hidden="true">
        <circle
          cx="44"
          cy="44"
          r="34"
          fill="none"
          stroke="rgba(26,11,7,.35)"
          strokeWidth="10"
        />
        <circle
          cx="44"
          cy="44"
          r="34"
          fill="none"
          stroke="#f2ff00"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="213.6"
          strokeDashoffset={213.6 * (1 - score / 100)}
          transform="rotate(-90 44 44)"
        />
      </svg>
      <strong>{score}%</strong>
    </div>
  );
}
