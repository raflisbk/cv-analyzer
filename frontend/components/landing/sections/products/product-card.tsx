import Link from "next/link";
import { products } from "@/lib/landing-products";
import PlaneIcon from "../plane-icon";
import MarginNote from "../../pen/margin-note";
import ProductPreview from "./product-preview";
import base from "../section.module.css";
import styles from "./products.module.css";

export default function ProductCard({
  product,
  index,
}: {
  product: (typeof products)[number];
  index: number;
}) {
  return (
    <article className={`${styles.card} ${styles[`card${index}`]}`}>
      <div className={styles.cardInner}>
        <ProductPreview index={index} />
        <span
          className={styles.status}
          id={index === 0 ? "live-product" : undefined}
          aria-describedby={index === 0 ? "live-product-note" : undefined}
        >
          {product.status}
        </span>
        {index === 0 && (
          <div className={styles.note}>
            <MarginNote targetId="live-product" variant={1}>
              Start here
            </MarginNote>
          </div>
        )}
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        {product.live && (
          <Link className={base.button} href="/app">
            Try it free <PlaneIcon size={52} />
          </Link>
        )}
      </div>
    </article>
  );
}
