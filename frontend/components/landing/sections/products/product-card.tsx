"use client";
import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  return (
    <article className={`${styles.card} ${styles[`card${index}`]}`}>
      <div className={styles.cardInner}>
        <ProductPreview index={index} />
        <span
          className={styles.status}
          id={index === 0 ? "live-product" : undefined}
          aria-describedby={index === 0 ? "live-product-note" : undefined}
        >
          {t(`landing.products.statuses.${product.live ? "live" : "planned"}`)}
        </span>
        {index === 0 && (
          <div className={styles.note}>
            <MarginNote targetId="live-product" variant={1}>
              {t("landing.products.note")}
            </MarginNote>
          </div>
        )}
        <h3>{t(`landing.products.names.${product.key}`)}</h3>
        <p>{t(`landing.products.descriptions.${product.key}`)}</p>
        {product.live && (
          <Link className={base.button} href="/app">
            {t("landing.products.button")} <PlaneIcon size={52} />
          </Link>
        )}
      </div>
    </article>
  );
}
