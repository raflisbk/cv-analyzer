/**
 * use-workspace-doc.ts — Yjs Y.Doc + IndexeddbPersistence + WebSocket provider hook.
 *
 * Phase 13 deliverable: proof-of-concept CRDT initialization (CRDT-01).
 * Membuktikan Yjs + y-indexeddb bisa diinisialisasi di Next.js App Router
 * tanpa SSR crash.
 *
 * Phase 16: adds y-websocket WebsocketProvider for CRDT sync (CRDT-02).
 *
 * SSR safety: y-indexeddb uses browser-only `indexedDB` global.
 * useEffect tidak pernah berjalan di server — aman.
 * Tidak boleh diimport di Server Components.
 *
 * Phase 14: adds statusMapRef for suggestion_statuses Y.Map (CRDT-02).
 */
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

/**
 * Hook untuk menginisialisasi Yjs Y.Doc dengan IndexedDB persistence.
 *
 * @param jobId - Job UUID untuk scope IndexedDB key
 * @returns refs ke Y.Doc, IndexeddbPersistence, dan Y.Map suggestion_statuses
 *
 * @example
 * // Dalam "use client" component:
 * const { docRef, statusMapRef } = useWorkspaceDoc(jobId);
 */
export function useWorkspaceDoc(jobId: string): UseWorkspaceDocResult {
  const docRef = useRef<Y.Doc | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const statusMapRef = useRef<Y.Map<string> | null>(null);
  const wsProviderRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    if (!jobId) return;

    // Buat Y.Doc baru untuk job ini
    const doc = new Y.Doc();
    docRef.current = doc;

    // Shared map untuk suggestion statuses, keyed by suggestion_id
    const statusMap = doc.getMap<string>("suggestion_statuses");
    statusMapRef.current = statusMap;

    // Persist ke IndexedDB di bawah key yang scoped ke job
    // Format: "workspace-v2-{jobId}" untuk isolasi per job
    const persistence = new IndexeddbPersistence(`workspace-v2-${jobId}`, doc);
    persistenceRef.current = persistence;

    persistence.on("synced", () => {
      console.log("[Yjs] IndexedDB synced untuk job:", jobId);
    });

    // Cleanup saat component unmount atau jobId berubah
    return () => {
      persistence.destroy();
      doc.destroy();
      docRef.current = null;
      persistenceRef.current = null;
      statusMapRef.current = null;
    };
  }, [jobId]);

  // Phase 16: Yjs WebSocket provider for CRDT sync
  useEffect(() => {
    if (!jobId || !docRef.current) return;

    // Backend WS route: /api/v1/yws/{document_id} (in workspace.py router)
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
