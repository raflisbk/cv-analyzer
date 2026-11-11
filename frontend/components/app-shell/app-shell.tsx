"use client";

import { useState, type ReactNode } from "react";
import AppHeader from "./app-header";
import HistoryDrawer from "./history-drawer";
import PathyProvider from "@/components/pathy/pathy-provider";
import styles from "./app-shell.module.css";

export default function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const newChat = () => setChatKey((value) => value + 1);
  return (
    <PathyProvider>
      <div className={styles.app}>
        <svg
          className={styles.waves}
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M600 0C800 160 1050 90 1180 205S1400 190 1440 230V0Z" />
          <path d="M0 640C250 560 370 680 660 675S1170 400 1440 485V900H0Z" />
          <path d="M0 790C260 710 550 850 820 810S1240 700 1440 735V900H0Z" />
        </svg>
        <AppHeader
          openDrawer={() => setDrawerOpen(true)}
          drawerOpen={drawerOpen}
          newChat={newChat}
        />
        <main className={styles.main} key={chatKey}>
          {children}
        </main>
        <HistoryDrawer
          open={drawerOpen}
          close={() => setDrawerOpen(false)}
          newChat={newChat}
        />
      </div>
    </PathyProvider>
  );
}
