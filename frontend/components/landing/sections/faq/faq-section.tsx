"use client";
import Image from "next/image";
import { faqItems } from "@/lib/landing-faq";
import { useLandingFaq } from "@/hooks/use-landing-faq";
import { formatLandingCount, landingFacts } from "@/lib/landing-facts";
import base from "../section.module.css";
import styles from "./faq.module.css";
import PenUnderline from "../../pen/pen-underline";
import pen from "../../pen/pen.module.css";
export default function FaqSection() {
  const { ref, open, toggle } = useLandingFaq();
  return (
    <section
      ref={ref}
      id="faq"
      className={`${base.panel} ${base.blush} ${styles.grid}`}
    >
      <div>
        <h2>
          Questions,{" "}
          <span className={pen.target}>
            answered
            <PenUnderline variant={2} />
          </span>
        </h2>
        <div className={styles.objects} aria-hidden="true">
          <Image
            width={360}
            height={360}
            data-faq-object
            className={base.object}
            src="/landing/3d/question-mark.webp"
            alt=""
          />
          <Image
            width={360}
            height={360}
            data-faq-object
            className={base.object}
            src="/landing/3d/speech-bubbles.webp"
            alt=""
          />
        </div>
      </div>
      <div>
        {faqItems.map((item, i) => (
          <div data-faq-item className={styles.item} key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
                onClick={() => toggle(i)}
              >
                {item.question}
                <span aria-hidden="true">{open === i ? "×" : "+"}</span>
              </button>
            </h3>
            <div id={`faq-answer-${i}`} hidden={open !== i}>
              <p>
                {item.question === "How is the score calculated?"
                  ? `${formatLandingCount(landingFacts.scoreDimensions)} scored dimensions are combined, then adjusted by rule checks such as numbers per bullet and action verbs.`
                  : item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
