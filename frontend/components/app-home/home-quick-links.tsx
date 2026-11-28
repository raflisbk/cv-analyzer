"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import type { CvSummary } from "@/lib/app-api/cvs.types";
import styles from "./home.module.css";

const CHIPS = ["quickScore", "quickMatch", "quickWhy"];

export default function HomeQuickLinks({
  latest,
  send,
}: {
  latest?: CvSummary;
  send: (text: string) => void;
}) {
  const { t } = useT();
  return (
    <div className={styles.extras}>
      <div className={styles.chips}>
        {CHIPS.map((key) => {
          const text = t(`app.home.${key}`);
          return (
            <button key={key} type="button" onClick={() => send(text)}>
              {text}
            </button>
          );
        })}
      </div>
      {latest && (
        <Link
          className={styles.resume}
          href={`/app/cvs/${latest.jobId}?view=editor`}
          aria-label={`${t("app.home.continue")}: ${latest.fileName}`}
        >
          <b>{latest.score ?? "—"}</b>
          <span>{t("app.home.continue")}</span>
          <small>{latest.fileName}</small>
        </Link>
      )}
    </div>
  );
}
