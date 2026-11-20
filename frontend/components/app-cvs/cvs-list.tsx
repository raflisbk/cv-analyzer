"use client";

import { useQuery } from "@tanstack/react-query";
import { useT } from "@/components/i18n/i18n-provider";
import { listCvs } from "@/lib/app-api/cvs";
import ListHeader from "@/components/app-shell/list-header";
import EmptyState from "@/components/app-shell/empty-state";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import CvCard from "./cv-card";
import shell from "@/components/app-shell/app-shell.module.css";
import styles from "./cvs.module.css";

export default function CvsList() {
  const { t } = useT();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["app-cvs"],
    queryFn: listCvs,
  });
  return (
    <section className={`${shell.sheet} ${styles.list}`}>
      <ListHeader type="cvs" />
      <p className={styles.lead}>{t("app.cvs.lead")}</p>
      {isLoading && <LoadingSkeleton label={t("app.cvs.loading")} />}
      {isError && (
        <p role="alert">
          {t("app.cvs.loadError")}{" "}
          <button onClick={() => refetch()}>{t("app.cvs.retry")}</button>
        </p>
      )}
      {data?.length === 0 && <EmptyState type="cvs" />}
      {data && data.length > 0 && (
        <div className={styles.grid}>
          {data.map((cv) => (
            <CvCard key={cv.jobId} cv={cv} />
          ))}
        </div>
      )}
    </section>
  );
}
