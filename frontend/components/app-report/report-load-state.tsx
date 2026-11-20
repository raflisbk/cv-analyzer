import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import styles from "./report.module.css";

export function ReportLoadState({
  kind,
  retry,
}: {
  kind: "loading" | "error" | "empty";
  retry?: () => void;
}) {
  const { t } = useT();
  if (kind === "loading") {
    return (
      <section className={styles.state}>
        <LoadingSkeleton label={t("appReport.load.loading")} />
      </section>
    );
  }
  return (
    <section
      className={styles.state}
      role={kind === "error" ? "alert" : "status"}
    >
      <Image src="/pathy/sad.webp" alt="" width={120} height={130} />
      <h1>
        {kind === "error"
          ? t("appReport.load.error")
          : t("appReport.load.empty")}
      </h1>
      {kind === "error" ? (
        <button className={`${styles.pill} ${styles.punk}`} onClick={retry}>
          {t("appReport.load.retry")}
        </button>
      ) : (
        <p>{t("appReport.load.emptyBody")}</p>
      )}
    </section>
  );
}
