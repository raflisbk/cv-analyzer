import Link from "next/link";
import type { CvSummary } from "@/lib/app-api/cvs.types";
import styles from "./home.module.css";

export default function HomeQuickLinks({
  latest,
  send,
}: {
  latest?: CvSummary;
  send: (text: string) => void;
}) {
  return (
    <>
      <div className={styles.quick}>
        {["Score my CV", "Match it to a job", "Why is my score low?"].map(
          (text) => (
            <button key={text} onClick={() => send(text)}>
              {text}
            </button>
          ),
        )}
      </div>
      {latest && (
        <div className={styles.continue}>
          <span>Continue where you left off</span>
          <Link href={`/app/cvs/${latest.jobId}?view=editor`}>
            <b>{latest.score ?? "—"}</b>
            {latest.fileName}
          </Link>
        </div>
      )}
    </>
  );
}
