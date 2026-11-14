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
  const answer =
    item.question === "How is the score calculated?"
      ? `${formatLandingCount(landingFacts.scoreDimensions)} scored dimensions are combined, then adjusted by rule checks such as numbers per bullet and action verbs.`
      : item.answer;
  return (
    <div data-faq-item className={styles.item}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`faq-answer-${index}`}
          onClick={onToggle}
        >
          {item.question}
          <span aria-hidden="true">{open ? "×" : "+"}</span>
        </button>
      </h3>
      <div id={`faq-answer-${index}`} hidden={!open}>
        <p>{answer}</p>
      </div>
    </div>
  );
}
