import styles from "./pathy.module.css";

export default function PathyTourControls({
  index,
  total,
  back,
  next,
  close,
}: {
  index: number;
  total: number;
  back: () => void;
  next: () => void;
  close: () => void;
}) {
  return (
    <>
      <div className={styles.tourActions}>
        <button onClick={back} disabled={index === 0}>
          Back
        </button>
        <button onClick={next}>{index + 1 === total ? "Done" : "Next"}</button>
        <button onClick={close}>Skip</button>
      </div>
      <div className={styles.dots} aria-label="Tour progress">
        {Array.from({ length: total }, (_, i) => (
          <i key={i} data-active={i === index} />
        ))}
      </div>
    </>
  );
}
