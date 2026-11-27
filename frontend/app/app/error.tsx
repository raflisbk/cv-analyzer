"use client";

import { useT } from "@/components/i18n/i18n-provider";

export default function AppError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { t } = useT();
  return (
    <div
      role="alert"
      style={{ background: "var(--app-blush)", padding: 24, borderRadius: 24 }}
    >
      <h1>{t("errors.boundary.title")}</h1>
      <p>{t("errors.boundary.appBody")}</p>
      <button onClick={reset}>{t("errors.boundary.retry")}</button>
    </div>
  );
}
