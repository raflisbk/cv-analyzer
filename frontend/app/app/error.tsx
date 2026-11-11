"use client";

export default function AppError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      style={{ background: "var(--app-blush)", padding: 24, borderRadius: 24 }}
    >
      <h1>Something went wrong</h1>
      <p>We could not open this page.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
