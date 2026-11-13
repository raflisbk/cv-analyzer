export function WorkspaceLoadError({
  error,
  retry,
}: {
  error: Error | null;
  retry: () => void;
}) {
  return error ? (
    <p role="alert">
      Workspace could not load.{" "}
      <button type="button" onClick={retry}>
        Try again
      </button>
    </p>
  ) : null;
}
