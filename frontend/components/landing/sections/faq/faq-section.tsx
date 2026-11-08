"use client";
import Image from "next/image";
import { useState } from "react";
import { faqItems, nextFaqOpen } from "@/lib/landing-faq";
import { useLandingStory } from "@/hooks/use-landing-story";
import { faqMotion } from "@/components/landing/motion/faq";
import base from "../section.module.css";
import styles from "./faq.module.css";
export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useLandingStory(faqMotion, 120);
  return (
    <section
      ref={ref}
      id="faq"
      className={`${base.panel} ${base.snow} ${styles.grid}`}
    >
      <div>
        <h2>Questions, answered</h2>
        <span className={base.hand}>still unsure? just try it</span>
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
                onClick={() => setOpen(nextFaqOpen(open, i))}
              >
                {item.question}
                <span aria-hidden="true">{open === i ? "×" : "+"}</span>
              </button>
            </h3>
            <div id={`faq-answer-${i}`} hidden={open !== i}>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
