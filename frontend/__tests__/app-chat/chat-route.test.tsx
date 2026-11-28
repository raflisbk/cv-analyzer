import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { isChatRoute } from "@/components/app-shell/chat-route";
import PathyProvider from "@/components/pathy/pathy-provider";
import { withLocale } from "../i18n/with-locale";

let pathname = "/app";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

it.each([
  ["/app", true],
  ["/app/chat/abc", true],
  ["/app/cvs", false],
  ["/app/cvs/job1", false],
  ["/app/reports", false],
  ["/", false],
])("isChatRoute(%s) is %s", (path, expected) => {
  expect(isChatRoute(path)).toBe(expected);
});

it("hides the floating helper on chat routes only", () => {
  pathname = "/app/chat/abc";
  const view = render(withLocale(<PathyProvider>content</PathyProvider>));
  expect(screen.queryByRole("button", { name: /Pathy/ })).toBeNull();
  view.unmount();
  pathname = "/app/cvs";
  render(withLocale(<PathyProvider>content</PathyProvider>));
  expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
});
