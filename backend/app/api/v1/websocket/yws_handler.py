"""
Yjs WebSocket handler.
Handles real-time CRDT sync for collaborative editing.
"""

from fastapi import WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState

from app.core.logging import structured_logger as logger


class YjsConnectionManager:
    """Manages Yjs WebSocket connections for document collaboration."""

    def __init__(self) -> None:
        # Map document_id to set of connected WebSockets
        self.active_connections: dict[str, set[WebSocket]] = {}

    async def connect(self, document_id: str, websocket: WebSocket) -> None:
        """Connect a WebSocket to a document room."""
        await websocket.accept()

        if document_id not in self.active_connections:
            self.active_connections[document_id] = set()

        self.active_connections[document_id].add(websocket)

        logger.info(
            "yjs_ws_connected",
            document_id=document_id,
            connections=len(self.active_connections[document_id]),
        )

    def disconnect(self, document_id: str, websocket: WebSocket) -> None:
        """Disconnect a WebSocket from a document room."""
        if document_id in self.active_connections:
            self.active_connections[document_id].discard(websocket)

            # Clean up empty rooms
            if not self.active_connections[document_id]:
                del self.active_connections[document_id]

        logger.info("yjs_ws_disconnected", document_id=document_id)

    async def broadcast(
        self, document_id: str, message: bytes, sender: WebSocket
    ) -> None:
        """Broadcast a message to all connected clients in a document room."""
        if document_id not in self.active_connections:
            return

        # Send to all connected clients except sender
        for connection in self.active_connections[document_id]:
            if (
                connection != sender
                and connection.application_state == WebSocketState.CONNECTED
            ):
                try:
                    await connection.send_bytes(message)
                except Exception as e:
                    logger.error(
                        "yjs_ws_send_failed", error=str(e), document_id=document_id
                    )

    async def send_state_vector(
        self, document_id: str, websocket: WebSocket, state_vector: bytes
    ) -> None:
        """Send state vector request for sync."""
        await websocket.send_bytes(state_vector)


# Global connection manager instance
manager = YjsConnectionManager()


async def yjs_websocket_endpoint(websocket: WebSocket, document_id: str) -> None:
    """
    WebSocket endpoint for Yjs CRDT sync.

    Handles:
    - Document room connection/disconnection
    - Message broadcasting between clients
    - State vector sync for new connections
    """
    await manager.connect(document_id, websocket)

    try:
        while True:
            # Receive binary message from client
            message = await websocket.receive_bytes()

            # Broadcast to other clients in the same document room
            await manager.broadcast(document_id, message, websocket)

    except WebSocketDisconnect:
        manager.disconnect(document_id, websocket)
    except Exception as e:
        logger.error("yjs_ws_error", error=str(e), document_id=document_id)
        manager.disconnect(document_id, websocket)
