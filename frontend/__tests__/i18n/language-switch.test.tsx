import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LanguageSwitch from "@/components/landing/navbar/language-switch";
import { I18nProvider } from "@/components/i18n/i18n-provider";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

it("updates aria state, cookie and refreshes server content", () => {
  render(
    <I18nProvider initialLocale="id">
      <LanguageSwitch />
    </I18nProvider>,
  );
  expect(screen.getByRole("button", { name: "ID" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "EN" }));
  expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(document.cookie).toContain("pathkr-locale=en");
  expect(refresh).toHaveBeenCalledOnce();
});
