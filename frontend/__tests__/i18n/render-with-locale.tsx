import type { ReactNode } from "react";
import { render as renderUi } from "@testing-library/react";
import type { Locale } from "@/lib/i18n/locales";
import { withLocale } from "./with-locale";

export function render(ui: ReactNode, locale: Locale = "en") {
  return renderUi(withLocale(ui, locale));
}

export function localeWrapper({ children }: { children: ReactNode }) {
  return withLocale(children);
}
