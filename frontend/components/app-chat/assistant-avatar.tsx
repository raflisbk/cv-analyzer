import Image from "next/image";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import styles from "./message.module.css";

export default function AssistantAvatar() {
  return (
    <span className={styles.avatar} aria-hidden="true">
      <Image
        src={pathyPoseSrc("hello")}
        alt=""
        width={30}
        height={30}
        unoptimized
      />
    </span>
  );
}
