import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import UploadCvButton from "./upload-cv-button";
import folder from "./folder.webp";
import compass from "./compass.webp";
import styles from "./list-header.module.css";

export default function ListHeader({ type }: { type: "cvs" | "reports" }) {
  return (
    <header className={styles.header}>
      <Image
        className={styles.icon}
        src={type === "cvs" ? folder : compass}
        alt=""
        width={54}
        height={54}
      />
      <h1>{type === "cvs" ? "My CVs" : "Reports"}</h1>
      {USE_APP_MOCKS && (
        <span className={styles.badge}>
          Sample data <HelpButton helpKey={type} />
        </span>
      )}
      <span className={styles.note}>
        {type === "cvs"
          ? "your files, your scores"
          : "every version, one place"}
      </span>
      <span className={styles.spacer} />
      <UploadCvButton />
    </header>
  );
}
