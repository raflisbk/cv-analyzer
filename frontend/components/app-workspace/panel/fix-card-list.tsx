import { useT } from "@/components/i18n/i18n-provider";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { FixCard } from "./fix-card";

export function FixCardList({
  fixes,
  onApply,
  onShow,
}: {
  fixes: WorkspaceFix[];
  onApply: (
    fix: WorkspaceFix,
    text: string,
    anchor: HTMLElement,
    answers: Record<string, string>,
  ) => boolean;
  onShow?: (id: string, section: string) => void;
}) {
  const { t } = useT();
  if (!fixes.length) {
    return <p>{t("appWorkspacePanel.fixes.done")}</p>;
  }
  return (
    <>
      {fixes.map((fix) => (
        <FixCard
          key={fix.id}
          fix={fix}
          onShow={onShow}
          onApply={(text, anchor, answers) =>
            onApply(fix, text, anchor, answers)
          }
        />
      ))}
    </>
  );
}
