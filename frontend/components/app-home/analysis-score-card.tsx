import Link from "next/link";
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
  return (
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
  );
}
