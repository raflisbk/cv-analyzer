"use client";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/landing-products";
import { useLandingStory } from "@/hooks/use-landing-story";
import { productsMotion } from "@/components/landing/motion/products";
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
              <div className={styles.imageFrame}>
                <Image
                  width={360}
                  height={360}
                  className={base.object}
                  src={`/landing/3d/${product.image}.webp`}
                  alt=""
                  aria-hidden="true"
                />
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
