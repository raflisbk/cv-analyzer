import styles from "./pathy.module.css";

export default function PathySpotlight({ rect }: { rect: DOMRect | null }) {
  return rect ? (
    <div
      className={styles.spotlight}
      style={{
        left: rect.left - 8,
        top: rect.top - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      }}
    />
  ) : null;
}
