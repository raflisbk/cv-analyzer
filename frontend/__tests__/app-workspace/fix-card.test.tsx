import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { FixCard } from "@/components/app-workspace/panel/fix-card";

it("waits for a user number before applying a fix", async () => {
  const user = userEvent.setup();
  const onApply = vi.fn(() => true);
  render(
    <FixCard
      fix={{
        id: "one",
        section: "Experience",
        before: "Led a team.",
        after: "Led [how many?] people.",
        explanation: "Add team size",
        label: "No number",
        points: 3,
      }}
      onApply={onApply}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Apply" }));
  expect(onApply).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid number");
  await user.type(screen.getByPlaceholderText("Your number"), "6");
  await user.click(screen.getByRole("button", { name: "Apply" }));
  expect(onApply).toHaveBeenCalledWith(
    "Led 6 people.",
    expect.any(HTMLElement),
    {},
  );
});

it("asks every backend question before applying the rewrite", async () => {
  const user = userEvent.setup();
  const onApply = vi.fn(() => true);
  render(
    <FixCard
      fix={{
        id: "Experience_0_0",
        section: "Experience",
        before: "Led team",
        after: "Led [team size] people in [timeframe]",
        explanation: "Add scale",
        label: "No number",
        points: 3,
        needsInput: [
          { token: "[team size]", question: "How many people?" },
          { token: "[timeframe]", question: "Over what period?" },
        ],
      }}
      onApply={onApply}
    />,
  );
  await user.type(screen.getByLabelText("How many people?"), "6");
  await user.click(screen.getByRole("button", { name: "Apply" }));
  expect(onApply).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText("Over what period?"), "2 years");
  await user.click(screen.getByRole("button", { name: "Apply" }));
  expect(onApply).toHaveBeenCalledWith(
    "Led 6 people in 2 years",
    expect.any(HTMLElement),
    {
      "[team size]": "6",
      "[timeframe]": "2 years",
    },
  );
});
