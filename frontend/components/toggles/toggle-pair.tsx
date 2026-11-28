import LanguageButton from "./language-button";
import ThemeButton from "./theme-button";
import styles from "./toggle-pair.module.css";

export default function TogglePair({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.pair} ${compact ? styles.phoneOnly : ""}`}>
      <ThemeButton />
      <LanguageButton />
    </div>
  );
}
