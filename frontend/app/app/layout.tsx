import type { ReactNode } from "react";
import "./app-tokens.css";
import AppShell from "@/components/app-shell/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-root">
      <AppShell>{children}</AppShell>
    </div>
  );
}
