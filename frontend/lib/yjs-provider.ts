

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/yjs";

export function createYjsProvider(documentId: string) {
  const ydoc = new Y.Doc();

  const awareness = new Awareness(ydoc);

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
