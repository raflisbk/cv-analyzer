"use client";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";

interface UseWorkspaceDocResult {
  docRef: React.MutableRefObject<Y.Doc | null>;
  persistenceRef: React.MutableRefObject<IndexeddbPersistence | null>;
  statusMapRef: React.MutableRefObject<Y.Map<string> | null>;
  wsProviderRef: React.MutableRefObject<WebsocketProvider | null>;
}

export function useWorkspaceDoc(jobId: string): UseWorkspaceDocResult {
  const docRef = useRef<Y.Doc | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const statusMapRef = useRef<Y.Map<string> | null>(null);
  const wsProviderRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const doc = new Y.Doc();
    docRef.current = doc;

    const statusMap = doc.getMap<string>("suggestion_statuses");
    statusMapRef.current = statusMap;

    const persistence = new IndexeddbPersistence(`workspace-v2-${jobId}`, doc);
    persistenceRef.current = persistence;

    persistence.on("synced", () => {
    });

    return () => {
      persistence.destroy();
      doc.destroy();
      docRef.current = null;
      persistenceRef.current = null;
      statusMapRef.current = null;
    };
  }, [jobId]);

  useEffect(() => {
    if (!jobId || !docRef.current) return;

    const wsUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("http://", "ws://").replace(
        "https://",
        "wss://"
      ) || "ws://localhost:8000/api/v1";

    const wsProvider = new WebsocketProvider(
      `${wsUrl}/yws`,
      jobId,
      docRef.current,
      { connect: true }
    );

    wsProviderRef.current = wsProvider;

    wsProvider.on("status", (event: { status: string }) => {
      console.log("[Yjs] WebSocket status:", event.status);
    });

    return () => {
      wsProvider.destroy();
      wsProviderRef.current = null;
    };
  }, [jobId]);

  return { docRef, persistenceRef, statusMapRef, wsProviderRef };
}
