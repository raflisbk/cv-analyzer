export function ReportStatus({ error }: { error?: boolean }) {
  return error ? (
    <div role="alert">Report could not load. Try again later.</div>
  ) : (
    <div role="status">Your report is still processing.</div>
  );
}
