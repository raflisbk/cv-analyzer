import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PathyTour from "@/components/pathy/pathy-tour";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/app",
  useRouter: () => ({ push }),
}));

describe("PathyTour", () => {
  it("progresses and closes from the tour controls", () => {
    const close = vi.fn();
    render(<PathyTour name="full" close={close} />);
    expect(
      screen.getByRole("heading", { name: "Hi, I'm Pathy" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("heading", { name: "Three places to go" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(
      screen.getByRole("heading", { name: "Hi, I'm Pathy" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(close).toHaveBeenCalled();
  });
});
