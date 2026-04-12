/**
 * use-workspace-doc.ts — Yjs Y.Doc + IndexeddbPersistence hook.
 *
 * Phase 13 deliverable: proof-of-concept CRDT initialization (CRDT-01).
 * Membuktikan Yjs + y-indexeddb bisa diinisialisasi di Next.js App Router
 * tanpa SSR crash.
 *
 * SSR safety: y-indexeddb uses browser-only `indexedDB` global.
 * useEffect tidak pernah berjalan di server — aman.
 * Tidak boleh diimport di Server Components.
 */
"use client";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

interface UseWorkspaceDocResult {
  docRef: React.MutableRefObject<Y.Doc | null>;
  persistenceRef: React.MutableRefObject<IndexeddbPersistence | null>;
}

/**
 * Hook untuk menginisialisasi Yjs Y.Doc dengan IndexedDB persistence.
 *
 * @param jobId - Job UUID untuk scope IndexedDB key
 * @returns refs ke Y.Doc dan IndexeddbPersistence instances
 *
 * @example
 * // Dalam "use client" component:
 * const { docRef } = useWorkspaceDoc(jobId);
 */
export function useWorkspaceDoc(jobId: string): UseWorkspaceDocResult {
  const docRef = useRef<Y.Doc | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);

  useEffect(() => {
    if (!jobId) return;

    // Buat Y.Doc baru untuk job ini
    const doc = new Y.Doc();
    docRef.current = doc;

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
    };
  }, [jobId]);

  return { docRef, persistenceRef };
}
