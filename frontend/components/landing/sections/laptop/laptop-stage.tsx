import { useLaptopFrames } from "./use-laptop-frames";
import LaptopScene from "./scene/laptop-scene";
import styles from "./laptop.module.css";

export default function LaptopStage() {
  const canvasRef = useLaptopFrames();
  return (
    <div className={styles.anchor} data-laptop-anchor>
      <div className={styles.stage} data-laptop-stage>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          data-laptop-canvas
          width={792}
          height={712}
          aria-label="Opening laptop"
          role="img"
        />
        <div data-laptop-screen className={styles.screen}>
          <LaptopScene />
        </div>
      </div>
    </div>
  );
}
