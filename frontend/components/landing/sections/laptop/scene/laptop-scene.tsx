"use client";

import { useEffect, useRef } from "react";
import { measureLaptopScene } from "@/components/landing/motion/laptop-scene";
import CvPaper from "./cv-paper";
import InsightPanel from "./insight-panel";
import SceneObjects from "./scene-objects";
import styles from "./scene.module.css";

export default function LaptopScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }
    const measure = () => measureLaptopScene(scene);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return (
    <div className={styles.scene} data-laptop-scene ref={sceneRef}>
      <CvPaper />
      <SceneObjects />
      <InsightPanel />
    </div>
  );
}
