"use client";

import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import UploadCvButton from "./upload-cv-button";
import styles from "./empty-state.module.css";

export default function EmptyState({ type }: { type: "cvs" | "reports" }) {
  const { t } = useT();
  return (
    <div className={styles.empty}>
      <Image
        src={pathyPoseSrc(type === "cvs" ? "hello" : "sad")}
        alt=""
        width={120}
        height={120}
        unoptimized
      />
      <h2>
        {t(type === "cvs" ? "app.empty.cvsTitle" : "app.empty.reportsTitle")}
      </h2>
      <p>{t("app.empty.body")}</p>
      <UploadCvButton />
    </div>
  );
}
