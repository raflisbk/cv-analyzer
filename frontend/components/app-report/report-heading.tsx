import HelpButton from "@/components/pathy/help-button";
import styles from "./report.module.css";

export function ReportHeading({
  title,
  helpKey,
}: {
  title: string;
  helpKey: string;
}) {
  return (
    <div className={styles.eyebrow}>
      <span>{title}</span>
      <HelpButton helpKey={helpKey} />
    </div>
  );
}
