import { useT } from "@/components/i18n/i18n-provider";

export function WorkspaceLoadError({
  error,
  retry,
}: {
  error: Error | null;
  retry: () => void;
}) {
  const { t } = useT();
  return error ? (
    <p role="alert">
      {t("appWorkspace.state.loadError")}{" "}
      <button type="button" onClick={retry}>
        {t("appWorkspace.state.retry")}
      </button>
    </p>
  ) : null;
}
