import styles from "./workspace-styles";

export function WorkspaceTitle({
  name,
  role,
  version,
  saveState,
}: {
  name: string;
  role: string;
  version?: string;
  saveState: string;
}) {
  const status =
    saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Save failed"
        : "Saved";
  return (
    <div className={styles.name}>
      <div className={styles.crumb}>MY CVs / WORKSPACE</div>
      <h1 className={styles.title}>{name}</h1>
      <div className={styles.sub}>
        {[role.trim(), version?.trim(), status].filter(Boolean).join(" · ")}
      </div>
    </div>
  );
}
