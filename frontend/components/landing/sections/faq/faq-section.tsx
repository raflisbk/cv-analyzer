"use client";
import { faqItems } from "@/lib/landing-faq";
import { useFaqSection } from "./use-faq-section";
import base from "../section.module.css";
import styles from "./faq.module.css";
import FaqHeader from "./faq-header";
import FaqItem from "./faq-item";
export default function FaqSection() {
  const { ref, open, toggle } = useFaqSection();
  return (
    <section
      ref={ref}
      id="faq"
      data-nav-tone="snow"
      className={`${base.panel} ${base.snow} ${base.calm} ${styles.grid}`}
    >
      <FaqHeader />
      <div>
        {faqItems.map((item, i) => (
          <FaqItem
            item={item}
            index={i}
            open={open === i}
            onToggle={() => toggle(i)}
            key={item.key}
          />
        ))}
      </div>
    </section>
  );
}
