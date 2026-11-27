import type { ReactNode } from "react";
import styles from "./main.module.css";

type CvJobProps = {
  section?: string;
  title: string;
  range: string;
  children: ReactNode;
};

export default function CvJob({ section, title, range, children }: CvJobProps) {
  return (
    <div className={styles.job} data-sc-section={section}>
      <div className={styles.role}>
        <b>{title}</b>
        <span>{range}</span>
      </div>
      <ul>{children}</ul>
    </div>
  );
}
