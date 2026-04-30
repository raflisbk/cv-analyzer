/**
 * Yjs WebSocket Provider.
 * Enables real-time CRDT sync for Tiptap editor.
 *
 * Uses WebsocketProvider from y-websocket for real-time collaboration.
 * Documents are keyed by job_id for isolation.
 */

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function createYjsProvider(documentId: string) {
  // Create Y.js document
  const ydoc = new Y.Doc();

  // Create awareness for cursor/selection sharing
  const awareness = new Awareness(ydoc);

  // Create WebSocket provider for real-time sync
  // Note: Backend route is /api/v1/yws/{document_id}
  const wsProvider = new WebsocketProvider(
    `${WS_URL}/api/v1/yws`,
    documentId,
    ydoc,
    {
      connect: true,
      awareness,
    }
  );

  return {
    ydoc,
    wsProvider,
    awareness,
  };
}

export type YjsProvider = ReturnType<typeof createYjsProvider>;
