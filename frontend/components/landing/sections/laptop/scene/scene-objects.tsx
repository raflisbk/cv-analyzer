import { laptopInsights } from "@/lib/landing-laptop-insights";
import Image from "next/image";
import styles from "./scene.module.css";

export default function SceneObjects() {
  return (
    <>
      {laptopInsights.slice(1).map((insight) => (
        <Image
          key={insight.key}
          data-sc-object={insight.object}
          className={styles.object}
          src={`/landing/3d/${insight.object}.webp`}
          alt=""
          width={96}
          height={96}
          draggable={false}
        />
      ))}
    </>
  );
}
