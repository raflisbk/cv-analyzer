import Image from "next/image";
import type { HelpContent } from "@/lib/pathy/help-content";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import styles from "./help.module.css";

export default function HelpCard({
  content,
  close,
  tour,
  innerRef,
}: {
  content: HelpContent;
  close: () => void;
  tour: () => void;
  innerRef: React.RefObject<HTMLSpanElement | null>;
}) {
  return (
    <span
      ref={innerRef}
      className={styles.helpCard}
      role="dialog"
      aria-label={content.title}
    >
      <Image
        src={pathyPoseSrc(content.pose)}
        alt=""
        width={64}
        height={64}
        unoptimized
      />
      <strong>{content.title}</strong>
      <span>{content.text}</span>
      <span className={styles.helpActions}>
        <button onClick={close}>Got it</button>
        <button onClick={tour}>Show me the tour</button>
      </span>
    </span>
  );
}
