import asyncio
import functools
import random
from typing import Callable, Any

def retry_with_backoff(max_retries: int = 3, base_delay: float = 1.0):
    """
    Exponential backoff decorator for external API resilience.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    retries += 1
                    if retries == max_retries:
                        raise e
                    delay = base_delay * (2 ** retries) + random.uniform(0, 0.5)
                    print(f"Retrying {func.__name__} in {delay:.2f}s (Attempt {retries}/{max_retries}). Error: {e}")
                    await asyncio.sleep(delay)
        return wrapper
    return decorator

