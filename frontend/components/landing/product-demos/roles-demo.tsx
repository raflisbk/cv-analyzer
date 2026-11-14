"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./document-demos.module.css";

export default function RolesDemo() {
  const { t } = useT();
  return (
    <div className={styles.roles} aria-label={t("landing.products.rolesAlt")}>
      <div>
        <span>
          <strong>{t("landing.products.roleSenior")}</strong>
          <small>{t("landing.products.rolePayly")}</small>
        </span>
        <b>78% {t("landing.products.match")}</b>
      </div>
      <div>
        <span>
          <strong>{t("landing.products.roleUx")}</strong>
          <small>{t("landing.products.roleCommerce")}</small>
        </span>
        <b>72% {t("landing.products.match")}</b>
      </div>
    </div>
  );
}
