export function WorkspaceLoadError({ error }: { error: Error | null }) {
  return error ? (
    <p role="alert">Workspace could not load. Try again later.</p>
  ) : null;
}
