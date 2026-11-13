import Image from "next/image";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import UploadCvButton from "./upload-cv-button";
import styles from "./empty-state.module.css";

export default function EmptyState({ type }: { type: "cvs" | "reports" }) {
  return (
    <div className={styles.empty}>
      <Image
        src={pathyPoseSrc(type === "cvs" ? "hello" : "sad")}
        alt=""
        width={120}
        height={120}
        unoptimized
      />
      <h2>{type === "cvs" ? "No CVs yet" : "No reports yet"}</h2>
      <p>Upload a CV to see it here.</p>
      <UploadCvButton />
    </div>
  );
}
