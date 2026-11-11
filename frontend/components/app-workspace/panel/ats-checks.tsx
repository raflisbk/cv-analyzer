import type { AtsData } from "@/lib/app-api/ats.types";
import { AtsPlainText } from "./ats-plain-text";
import { AtsCheckGroups } from "./ats-check-groups";
import styles from "../workspace-styles";

export function AtsChecks({ data }: { data: AtsData }) {
  return (
    <>
      <AtsPlainText plainText={data.plainText} />
      <AtsCheckGroups checks={data.checks} />
      <div className={styles.check}>
        <span className={styles.checkIcon}>
          {data.hiddenText.found ? "!" : "✓"}
        </span>
        {data.hiddenText.found
          ? `Hidden text found: ${data.hiddenText.items.join(", ")}`
          : "No hidden text found"}
      </div>
    </>
  );
}
