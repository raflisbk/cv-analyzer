import { beforeEach, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useTheme } from "@/hooks/use-theme";

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

beforeEach(() => {
  document.cookie = "pathkr-theme=; Max-Age=0; Path=/";
  document.documentElement.removeAttribute("data-theme");
});

it("starts from the initial theme", () => {
  render(
    <ThemeProvider initialTheme="dark">
      <Probe />
    </ThemeProvider>,
  );
  expect(screen.getByRole("button")).toHaveTextContent("dark");
});

it("syncs to the theme already set on the html element", () => {
  document.documentElement.dataset.theme = "dark";
  render(
    <ThemeProvider initialTheme="light">
      <Probe />
    </ThemeProvider>,
  );
  expect(screen.getByRole("button")).toHaveTextContent("dark");
});

it("toggles, writes the cookie and sets data-theme and color-scheme", () => {
  render(
    <ThemeProvider initialTheme="light">
      <Probe />
    </ThemeProvider>,
  );
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button")).toHaveTextContent("dark");
  expect(document.cookie).toContain("pathkr-theme=dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(document.documentElement.style.colorScheme).toBe("dark");
  fireEvent.click(screen.getByRole("button"));
  expect(document.cookie).toContain("pathkr-theme=light");
  expect(document.documentElement.dataset.theme).toBe("light");
});

it("throws when used outside the provider", () => {
  expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
});
