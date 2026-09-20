"""Plumb prototype server — receives PCM audio over WebSocket, streams it to Deepgram for
ASR + diarization, extracts claims with Haiku, and broadcasts transcript/claim events back
to the same connection. One WebSocket connection == one recording session.

No verdicts anywhere (prototype scope). See packages/prototype-pwa/README.md.
"""

import json
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketState

from .session import Session

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("plumb.main")

app = FastAPI(title="Plumb prototype server")

# Prototype only: LAN testing from a phone means an unpredictable origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()

    async def emit(event: dict) -> None:
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.send_json(event)

    session = Session(emit=emit)

    try:
        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                break

            if "bytes" in message and message["bytes"] is not None:
                await session.feed_audio(message["bytes"])
                continue

            if "text" in message and message["text"] is not None:
                await _handle_action(session, message["text"])

    except WebSocketDisconnect:
        pass
    finally:
        await session.stop()
        logger.info("connection closed, session=%s", session.session_id)


async def _handle_action(session: Session, raw_text: str) -> None:
    try:
        payload = json.loads(raw_text)
    except json.JSONDecodeError:
        logger.warning("Non-JSON control message dropped: %r", raw_text)
        return

    action = payload.get("action")
    if action == "start":
        await session.start()
    elif action == "stop":
        await session.stop()
    else:
        logger.warning("Unknown action: %r", action)
