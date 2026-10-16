"""Rate limiting configuration and safe client IP resolution utilities using SlowAPI."""

import logging
from fastapi import Request
from slowapi import Limiter
from app.config import settings

logger = logging.getLogger("rate_limit")


def get_safe_client_ip(request: Request) -> str:
    """Safely extracts client IP.

    Only trusts X-Forwarded-For if connecting peer is in TRUSTED_PROXIES.
    Otherwise, returns the connecting socket peer IP to prevent spoofing.
    """
    client_host = request.client.host if request.client else "127.0.0.1"

    if client_host in settings.TRUSTED_PROXIES:
        x_forwarded_for = request.headers.get("X-Forwarded-For")
        if x_forwarded_for:
            # First IP in X-Forwarded-For is the originating client IP
            origin_ip = x_forwarded_for.split(",")[0].strip()
            if origin_ip:
                return origin_ip

    return client_host


# Configure Rate Limit Storage:
# Uses Redis if reachable; automatically falls back to memory:// if Redis is offline
_storage_uri = "memory://"
try:
    import redis
    client = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1.0)
    client.ping()
    client.close()
    _storage_uri = settings.REDIS_URL
    logger.info("Rate limiter connected to Redis at %s", settings.REDIS_URL)
except Exception as exc:
    logger.warning(
        "Redis offline at %s (%s). Falling back to in-memory rate limiting (memory://).",
        settings.REDIS_URL,
        exc,
    )
    _storage_uri = "memory://"

limiter = Limiter(
    key_func=get_safe_client_ip,
    default_limits=["100/minute"],
    storage_uri=_storage_uri,
)

__all__ = ["limiter", "get_safe_client_ip"]
