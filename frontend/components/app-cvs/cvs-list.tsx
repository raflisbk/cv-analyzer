"use client";

import { useQuery } from "@tanstack/react-query";
import { listCvs } from "@/lib/app-api/cvs";
import ListHeader from "@/components/app-shell/list-header";
import EmptyState from "@/components/app-shell/empty-state";
import CvCard from "./cv-card";
import shell from "@/components/app-shell/app-shell.module.css";
import styles from "./cvs.module.css";

export default function CvsList() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["app-cvs"],
    queryFn: listCvs,
  });
  return (
    <section className={`${shell.sheet} ${styles.list}`}>
      <ListHeader type="cvs" />
      <p className={styles.lead}>
        Every file you uploaded. Open the report to read it, or the editor to
        change it.
      </p>
      {isLoading && <p role="status">Loading CVs…</p>}
      {isError && (
        <p role="alert">
          Could not load your CVs.{" "}
          <button onClick={() => refetch()}>Try again</button>
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
