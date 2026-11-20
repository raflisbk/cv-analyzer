"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import Image from "next/image";
import medal from "./medal.png";
import styles from "./home-thread.module.css";

export default function AnalysisScoreCard({
  jobId,
  count,
}: {
  jobId: string;
  count: number;
}) {
  const { t } = useT();
  return (
    <div className={styles.scoreCard}>
      <Image src={medal} alt="" width={72} height={72} />
      <small>{t("app.progress.overall")}</small>
      <h2>{t("app.progress.outOf", { score: count })}</h2>
      <p>{t("app.progress.reportHint")}</p>
      <div>
        <Link href={`/app/cvs/${jobId}?view=report`}>
          {t("app.progress.fullReport")}
        </Link>
        <Link href={`/app/cvs/${jobId}?view=editor&tab=chat`}>
          {t("app.progress.workspaceChat")}
        </Link>
      </div>
    </div>
  );
}
