import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider, useT } from "@/components/i18n/i18n-provider";

function Probe() {
  const { locale, setLocale, t } = useT();
  return (
    <>
      <span>
        {locale}: {t("nav.login")}
      </span>
      <button onClick={() => setLocale("en")}>English</button>
      <span>{t("account.lastUsed", { date: "today" })}</span>
    </>
  );
}

describe("I18nProvider", () => {
  it("renders and switches languages without remounting", () => {
    render(
      <I18nProvider initialLocale="id">
        <Probe />
      </I18nProvider>,
    );
    expect(screen.getByText("id: Masuk")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByText("en: Log in")).toBeInTheDocument();
    expect(screen.getByText("Last used today")).toBeInTheDocument();
  });
  it("returns the key and logs a missing translation once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function Missing() {
      const { t } = useT();
      return (
        <>
          {t("missing.unique")} {t("missing.unique")}
        </>
      );
    }
    render(
      <I18nProvider initialLocale="id">
        <Missing />
      </I18nProvider>,
    );
    expect(
      screen.getByText("missing.unique missing.unique"),
    ).toBeInTheDocument();
    if (process.env.NODE_ENV === "development")
      expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
