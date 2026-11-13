import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { FixCard } from "./fix-card";

export function FixCardList({
  fixes,
  onApply,
}: {
  fixes: WorkspaceFix[];
  onApply: (
    fix: WorkspaceFix,
    text: string,
    anchor: HTMLElement,
    answers: Record<string, string>,
  ) => boolean;
}) {
  if (!fixes.length) {
    return <p>All fixes reviewed. Your CV is ready for another look.</p>;
  }
  return (
    <>
      {fixes.map((fix) => (
        <FixCard
          key={fix.id}
          fix={fix}
          onApply={(text, anchor, answers) =>
            onApply(fix, text, anchor, answers)
          }
        />
      ))}
    </>
  );
}
