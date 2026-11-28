"use client";
import LaptopScene from "./scene/laptop-scene";
import LaptopCanvas from "./three/laptop-canvas";
import styles from "./laptop.module.css";
import { screenSize } from "@/lib/landing-laptop-screen";

export default function LaptopStage() {
  return (
    <>
      <LaptopCanvas />
      <div className={styles.screenLayer} aria-hidden="false">
        <div
          data-laptop-screen
          className={styles.screen}
          style={{ width: screenSize.width, height: screenSize.height }}
        >
          <LaptopScene />
        </div>
      </div>
    </>
  );
}
