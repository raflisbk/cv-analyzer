import styles from "./laptop-base.module.css";

const KEY_ROWS = [14, 14, 14, 13, 12];

export default function LaptopBase() {
  return (
    <div className={styles.hinge}>
      <div className={styles.shadow} />
      <div className={styles.deck}>
        <div className={styles.keys}>
          {KEY_ROWS.map((count, row) => (
            <div key={row} className={styles.row}>
              {Array.from({ length: count }, (_, key) => (
                <i key={key} />
              ))}
            </div>
          ))}
        </div>
        <div className={styles.pad} />
      </div>
      <div className={styles.lip} />
    </div>
  );
}
