"use client";
import { products } from "@/lib/landing-products";
import { useLandingStory } from "@/hooks/use-landing-story";
import { productsMotion } from "@/components/landing/motion/products";
import { useDemoOnce } from "@/components/landing/motion/demo-once";
import base from "../section.module.css";
import styles from "./products.module.css";
import ProductCard from "./product-card";

export default function ProductsSection() {
  const ref = useLandingStory(productsMotion);
  useDemoOnce(ref);
  return (
    <section ref={ref} id="products" className={`${base.panel} ${base.punk}`}>
      <div className={base.head}>
        <h2>One platform, three tools</h2>
      </div>
      <div className={styles.grid}>
        {products.map((product, index) => (
          <ProductCard product={product} index={index} key={product.name} />
        ))}
      </div>
    </section>
  );
}
