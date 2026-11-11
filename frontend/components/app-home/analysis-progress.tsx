"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useJobStream } from "@/hooks/use-job-stream";
import { useJobResults } from "@/hooks/use-job-results";
import { usePathy } from "@/components/pathy/pathy-context";
import styles from "./home-thread.module.css";
import medal from "./medal.png";

const steps = ["Read", "Analyze", "Score", "Grammar", "Suggest"];
const stages: Record<string, number> = {
  extracting: 0,
  parsing: 0,
  analyzing: 1,
  scoring: 2,
  grammar: 3,
  generating: 4,
  suggesting: 4,
  complete: 5,
};

export default function AnalysisProgress({ jobId }: { jobId: string }) {
  const [complete, setComplete] = useState(false);
  const [count, setCount] = useState(0);
  const { progress, error } = useJobStream(jobId, {
    onComplete: () => setComplete(true),
  });
  const result = useJobResults(complete ? jobId : null);
  const pathy = usePathy();
  const score = result.data?.scores?.overall ?? 0;
  useEffect(() => {
    pathy.react("running", "Reading your CV now.");
  }, [jobId, pathy]);
  useEffect(() => {
    if (complete) {
      pathy.react("trophy", "Your score is ready!");
    }
  }, [complete, pathy]);
  useEffect(() => {
    if (!complete || !score) {
      return;
    }
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(score, current + Math.ceil(score / 20));
      setCount(current);
      if (current >= score) {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [complete, score]);
  const active = stages[progress?.stage ?? "extracting"] ?? 0;
  return (
    <section className={styles.progress} aria-live="polite">
      <p>{progress?.message ?? "Reading your CV now."}</p>
      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div key={step}>
            <b>
              <i style={{ scale: index < active ? "1 1" : "0 1" }} />
            </b>
            {step}
          </div>
        ))}
      </div>
      {(error || progress?.stage === "failed" || result.isError) && (
        <p role="alert">
          Analysis could not finish. Open your CV to check its status.
        </p>
      )}
      {complete && result.data?.scores && (
        <div className={styles.scoreCard}>
          <Image src={medal} alt="" width={72} height={72} />
          <small>Overall score</small>
          <h2>{count} of 100</h2>
          <p>Open your report to see where your CV is strongest.</p>
          <div>
            <Link href={`/app/cvs/${jobId}?view=report`}>Open full report</Link>
            <Link href={`/app/cvs/${jobId}?view=editor&tab=chat`}>
              Continue in workspace chat
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
