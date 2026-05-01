from fastapi import WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState

from app.core.logging import structured_logger as logger


class YjsConnectionManager:

    def __init__(self) -> None:

        self.active_connections: dict[str, set[WebSocket]] = {}

    async def connect(self, document_id: str, websocket: WebSocket) -> None:
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
        if document_id in self.active_connections:
            self.active_connections[document_id].discard(websocket)

            if not self.active_connections[document_id]:
                del self.active_connections[document_id]

        logger.info("yjs_ws_disconnected", document_id=document_id)

    async def broadcast(
        self, document_id: str, message: bytes, sender: WebSocket
    ) -> None:
        if document_id not in self.active_connections:
            return

        for connection in self.active_connections[document_id]:
            if (
                connection != sender
                and connection.application_state == WebSocketState.CONNECTED
            ):
                try:
                    await connection.send_bytes(message)
                except Exception as e:
                    logger.error(
                        "yjs_ws_send_failed",
                        error=str(e),
                        document_id=document_id,
                        exc_info=True,
                    )

    async def send_state_vector(
        self, document_id: str, websocket: WebSocket, state_vector: bytes
    ) -> None:
        await websocket.send_bytes(state_vector)


manager = YjsConnectionManager()


async def yjs_websocket_endpoint(websocket: WebSocket, document_id: str) -> None:
    await manager.connect(document_id, websocket)

    try:
        while True:

            message = await websocket.receive_bytes()

            await manager.broadcast(document_id, message, websocket)

    except WebSocketDisconnect:
        manager.disconnect(document_id, websocket)
    except Exception as e:
        logger.error(
            "yjs_ws_error", error=str(e), document_id=document_id, exc_info=True
        )
        manager.disconnect(document_id, websocket)
