import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { GrammarPane } from "@/components/app-workspace/panel/grammar-pane";
import type { GrammarData } from "@/lib/app-api/grammar.types";

const data: GrammarData = {
  stats: {
    readingGrade: 9,
    wordsPerSentence: 14,
    passiveLines: 1,
    tone: "Confident",
  },
  notes: [
    {
      id: "one",
      type: "spelling",
      location: "Experience",
      before: "recieve",
      after: "receive",
    },
  ],
};

function GrammarFixture() {
  const [resolved, setResolved] = useState<Set<string>>(() => new Set());
  return (
    <GrammarPane
      data={data}
      resolved={resolved}
      onResolve={async (id) =>
        setResolved((current) => new Set(current).add(id))
      }
    />
  );
}

it("updates the note count and shows the clean state after accepting", async () => {
  const user = userEvent.setup();
  render(<GrammarFixture />);
  expect(screen.getByText("1 note to review")).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: /Accept spelling change/ }),
  );
  expect(screen.getByText("Clean copy!")).toBeInTheDocument();
  expect(screen.queryByText("recieve")).not.toBeInTheDocument();
});
