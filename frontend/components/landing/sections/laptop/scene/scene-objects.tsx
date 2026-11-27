import { laptopInsights } from "@/lib/landing-laptop-insights";
import SceneMark from "./scene-mark";
import styles from "./scene.module.css";

export default function SceneObjects() {
  return (
    <>
      {laptopInsights.slice(1).map(
        (insight) =>
          insight.mark && (
            <span
              key={insight.key}
              data-sc-object={insight.key}
              data-sc-mark={insight.mark}
              className={styles.object}
              aria-hidden="true"
            >
              <SceneMark kind={insight.mark} />
            </span>
          ),
      )}
    </>
  );
}
