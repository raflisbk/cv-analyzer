import styles from "./drawer.module.css";

export default function DrawerAccountFooter({
  name,
  logOut,
}: {
  name: string;
  logOut: () => void;
}) {
  return (
    <div className={styles.drawerFooter}>
      <span>{name}</span>
      <button type="button" onClick={logOut}>
        Log out
      </button>
    </div>
  );
}
