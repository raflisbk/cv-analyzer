"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import UploadCvButton from "./upload-cv-button";
import folder from "./folder.webp";
import compass from "./compass.webp";
import styles from "./list-header.module.css";

export default function ListHeader({ type }: { type: "cvs" | "reports" }) {
  const { t } = useT();
  return (
    <header className={styles.header}>
      <Image
        className={styles.icon}
        src={type === "cvs" ? folder : compass}
        alt=""
        width={54}
        height={54}
      />
      <h1>
        {t(type === "cvs" ? "app.list.cvsTitle" : "app.list.reportsTitle")}
      </h1>
      {USE_APP_MOCKS && (
        <span className={styles.badge}>
          {t("app.list.sample")} <HelpButton helpKey={type} />
        </span>
      )}
      <span className={styles.note}>
        {t(type === "cvs" ? "app.list.cvsNote" : "app.list.reportsNote")}
      </span>
      <span className={styles.spacer} />
      <UploadCvButton />
    </header>
  );
}
