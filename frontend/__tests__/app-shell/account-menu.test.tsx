import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AccountMenu from "@/components/landing/navbar/account-menu";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
const user = {
  id: "u1",
  email: "rafli@example.com",
  name: "Rafli",
  picture: null,
};

describe("AccountMenu", () => {
  it("links to My CVs inside the app", () => {
    render(<AccountMenu user={user} app />);
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByRole("menuitem", { name: /My CVs/ })).toHaveAttribute(
      "href",
      "/app/cvs",
    );
  });
  it("keeps the landing tile and routes it to the app", () => {
    render(<AccountMenu user={user} />);
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByRole("menuitem", { name: /Workspace/ })).toHaveAttribute(
      "href",
      "/app",
    );
  });
});
