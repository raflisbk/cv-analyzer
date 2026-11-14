import ScoreRing from "@/components/landing/product-demos/score-ring";
import ScoreBarsDemo from "@/components/landing/product-demos/score-bars-demo";
import BuilderDemo from "@/components/landing/product-demos/builder-demo";
import RolesDemo from "@/components/landing/product-demos/roles-demo";
import styles from "./products.module.css";

export default function ProductPreview({ index }: { index: number }) {
  return (
    <div className={styles.fragment}>
      {index === 0 && (
        <div className={styles.analyzer}>
          <ScoreRing />
          <ScoreBarsDemo compact />
        </div>
      )}
      {index === 1 && <BuilderDemo />}
      {index === 2 && <RolesDemo />}
    </div>
  );
}
