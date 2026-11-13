import asyncio
import threading

import pytest

from app.services.chat_stream.bridge import stream_in_thread


@pytest.mark.asyncio
async def test_bridge_delivers_first_chunk_before_generator_finishes():
    release = threading.Event()

    def chunks():
        yield "first"
        release.wait(1)
        yield "second"

    stream = stream_in_thread(chunks)
    assert await asyncio.wait_for(anext(stream), 0.5) == "first"
    release.set()
    assert await asyncio.wait_for(anext(stream), 0.5) == "second"
    await stream.aclose()


@pytest.mark.asyncio
async def test_bridge_stops_after_cancellation():
    release = threading.Event()
    advanced = threading.Event()

    def chunks():
        yield "first"
        release.wait(1)
        advanced.set()
        yield "second"

    stream = stream_in_thread(chunks)
    assert await anext(stream) == "first"
    await stream.aclose()
    release.set()
    assert await asyncio.to_thread(advanced.wait, 1)
    with pytest.raises(StopAsyncIteration):
        await anext(stream)
