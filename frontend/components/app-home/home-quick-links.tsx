"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import type { CvSummary } from "@/lib/app-api/cvs.types";
import styles from "./home.module.css";

export default function HomeQuickLinks({
  latest,
  send,
}: {
  latest?: CvSummary;
  send: (text: string) => void;
}) {
  const { t } = useT();
  return (
    <>
      <div className={styles.quick}>
        {["quickScore", "quickMatch", "quickWhy"].map((key) => {
          const text = t(`app.home.${key}`);
          return (
            <button key={key} onClick={() => send(text)}>
              {text}
            </button>
          );
        })}
      </div>
      {latest && (
        <div className={styles.continue}>
          <span>{t("app.home.continue")}</span>
          <Link href={`/app/cvs/${latest.jobId}?view=editor`}>
            <b>{latest.score ?? "—"}</b>
            {latest.fileName}
          </Link>
        </div>
      )}
    </>
  );
}
