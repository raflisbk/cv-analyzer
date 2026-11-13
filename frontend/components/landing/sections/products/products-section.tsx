"use client";
import Link from "next/link";
import { products } from "@/lib/landing-products";
import { useLandingStory } from "@/hooks/use-landing-story";
import { productsMotion } from "@/components/landing/motion/products";
import ScoreRing from "@/components/landing/product-demos/score-ring";
import ScoreBarsDemo from "@/components/landing/product-demos/score-bars-demo";
import BuilderDemo from "@/components/landing/product-demos/builder-demo";
import RolesDemo from "@/components/landing/product-demos/roles-demo";
import base from "../section.module.css";
import styles from "./products.module.css";
import PlaneIcon from "../plane-icon";

export default function ProductsSection() {
  const ref = useLandingStory(productsMotion);
  return (
    <section ref={ref} id="products" className={`${base.panel} ${base.punk}`}>
      <div className={base.head}>
        <h2>One platform, three tools</h2>
        <span className={base.hand}>starting with the CV</span>
      </div>
      <div className={styles.grid}>
        {products.map((product, index) => (
          <article
            className={`${styles.card} ${styles[`card${index}`]}`}
            key={product.name}
          >
            <div className={styles.cardInner}>
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
              <span className={styles.status}>{product.status}</span>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              {product.live && (
                <Link className={base.button} href="/app">
                  Try it free <PlaneIcon size={52} />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
