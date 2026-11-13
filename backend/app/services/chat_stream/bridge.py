import asyncio
import threading
from collections.abc import AsyncGenerator, Callable, Iterator


def run_worker(
    factory: Callable[[], Iterator[str]],
    loop: asyncio.AbstractEventLoop,
    queue: asyncio.Queue[tuple[str, object]],
    stopped: threading.Event,
) -> None:
    generator = None
    try:
        generator = factory()
        for chunk in generator:
            if stopped.is_set():
                break
            loop.call_soon_threadsafe(queue.put_nowait, ("chunk", chunk))
    except Exception as exc:
        if not stopped.is_set():
            loop.call_soon_threadsafe(queue.put_nowait, ("error", exc))
    finally:
        if generator is not None:
            close = getattr(generator, "close", None)
            if close:
                close()
        if not stopped.is_set():
            loop.call_soon_threadsafe(queue.put_nowait, ("done", None))


async def stream_in_thread(factory: Callable[[], Iterator[str]]) -> AsyncGenerator[str]:
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[tuple[str, object]] = asyncio.Queue()
    stopped = threading.Event()
    thread = threading.Thread(
        target=run_worker, args=(factory, loop, queue, stopped), daemon=True
    )
    thread.start()
    try:
        while True:
            kind, value = await queue.get()
            if kind == "done":
                break
            if kind == "error":
                raise value
            yield value
    finally:
        stopped.set()
