"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { faqItems } from "@/lib/landing-faq";
import { formatLandingCount, landingFacts } from "@/lib/landing-facts";
import styles from "./faq.module.css";

type Props = {
  item: (typeof faqItems)[number];
  index: number;
  open: boolean;
  onToggle: () => void;
};
export default function FaqItem({ item, index, open, onToggle }: Props) {
  const { t } = useT();
  const answer = t(`landing.faq.items.${item.key}.a`, {
    count: formatLandingCount(landingFacts.scoreDimensions),
  });
  return (
    <div data-faq-item className={styles.item}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`faq-answer-${index}`}
          onClick={onToggle}
        >
          {t(`landing.faq.items.${item.key}.q`)}
          <span aria-hidden="true">{open ? "×" : "+"}</span>
        </button>
      </h3>
      <div id={`faq-answer-${index}`} hidden={!open}>
        <p>{answer}</p>
      </div>
    </div>
  );
}
