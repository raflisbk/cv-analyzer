import asyncio
from collections.abc import Coroutine
from typing import Any

_running_tasks: set[asyncio.Task[Any]] = set()


def spawn(coroutine: Coroutine[Any, Any, Any]) -> asyncio.Task[Any]:
    """Run a fire-and-forget coroutine, holding a strong reference until it finishes.

    The event loop only keeps weak references to tasks, so an unreferenced task
    can be garbage-collected mid-execution.
    """
    task = asyncio.get_running_loop().create_task(coroutine)
    _running_tasks.add(task)
    task.add_done_callback(_running_tasks.discard)
    return task
