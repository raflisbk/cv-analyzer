import type { ReactNode } from "react";
import "./app-tokens.css";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="app-root">{children}</div>;
}
