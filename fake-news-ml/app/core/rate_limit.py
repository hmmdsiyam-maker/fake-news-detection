"""
core/rate_limit.py
------------------
Rate Limiter instance for SlowAPI.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
