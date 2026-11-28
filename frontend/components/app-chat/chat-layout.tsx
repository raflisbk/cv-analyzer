"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useChatAutoscroll } from "./use-chat-autoscroll";
import styles from "./chat.module.css";

const ArtifactPanel = dynamic(() => import("./artifact-panel"), {
  ssr: false,
});

interface ChatLayoutProps {
  children: ReactNode;
  bottom: ReactNode;
  empty?: boolean;
  scrollSignature: string;
  panel?: { jobId: string; open: boolean; close: () => void };
}

export default function ChatLayout({
  children,
  bottom,
  empty = false,
  scrollSignature,
  panel,
}: ChatLayoutProps) {
  const scroll = useChatAutoscroll(scrollSignature, !empty);
  const panelOpen = Boolean(panel?.open);
  return (
    <div className={styles.page} data-panel={panelOpen} data-empty={empty}>
      <div className={styles.left}>
        <div className={styles.scroll} ref={scroll}>
          {children}
        </div>
        <div className={styles.bottom}>{bottom}</div>
      </div>
      {panel && panelOpen && (
        <ArtifactPanel jobId={panel.jobId} close={panel.close} />
      )}
    </div>
  );
}
