"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./paper.module.css";

const GROUPS = [
  { label: "groupDesign", items: ["prototyping", "systems", "interaction"] },
  {
    label: "groupResearch",
    items: ["research", "usabilityTests", "interviews"],
  },
  { label: "groupTools", items: [] },
];
const TOOLS = ["Figma", "FigJam", "Maze", "Notion", "Jira", "Zeplin"];

export default function CvSkills() {
  const { t } = useT();
  return (
    <section data-sc-section="skills">
      <h6>{t("landing.sample.skills")}</h6>
      {GROUPS.map((group) => (
        <p key={group.label}>
          <b>{t(`landing.sample.${group.label}`)}</b>
          <br />
          {group.items.length
            ? group.items.map((item) => t(`landing.sample.${item}`)).join(", ")
            : TOOLS.join(", ")}
        </p>
      ))}
      <p className={styles.missing}>
        <span>SQL</span>
        <span>A/B testing</span>
      </p>
    </section>
  );
}
