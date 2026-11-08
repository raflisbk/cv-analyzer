import { useLaptopFrames } from "./use-laptop-frames";
import LaptopScene from "./scene/laptop-scene";
import styles from "./laptop.module.css";
import quadsData from "@/public/landing/laptop/screen-quads.json";
import { screenSize } from "@/lib/landing-laptop-screen";

export default function LaptopStage() {
  const canvasRef = useLaptopFrames();
  return (
    <div
      className={styles.anchor}
      data-laptop-anchor
      style={{ aspectRatio: `${quadsData.width} / ${quadsData.height}` }}
    >
      <div className={styles.stage} data-laptop-stage>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          data-laptop-canvas
          width={quadsData.width}
          height={quadsData.height}
          aria-label="Opening laptop"
          role="img"
        />
        <div
          data-laptop-screen
          className={styles.screen}
          style={{ width: screenSize.width, height: screenSize.height }}
        >
          <LaptopScene />
        </div>
      </div>
    </div>
  );
}
