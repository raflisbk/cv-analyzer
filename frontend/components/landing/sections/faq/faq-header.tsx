"use client";
import { useT } from "@/components/i18n/i18n-provider";
import PenUnderline from "../../pen/pen-underline";
import pen from "../../pen/pen.module.css";

export default function FaqHeader() {
  const { t } = useT();
  return (
    <div>
      <h2>
        <span className={pen.target}>
          {t("landing.faq.heading")}
          <PenUnderline variant={2} />
        </span>
      </h2>
    </div>
  );
}
