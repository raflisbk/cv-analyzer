import LoadingSkeleton from "@/components/app-shell/loading-skeleton";

export function ReportStatus({
  error,
  retry,
}: {
  error?: boolean;
  retry?: () => void;
}) {
  return error ? (
    <div role="alert">
      Report could not load.{" "}
      <button type="button" onClick={retry}>
        Try again
      </button>
    </div>
  ) : (
    <LoadingSkeleton label="Your report is still processing" />
  );
}
