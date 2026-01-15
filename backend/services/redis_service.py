"""
Redis Service
Caching and real-time data management
"""

from typing import Optional, Any
import json
import logging
import redis.asyncio as redis

from config import settings


logger = logging.getLogger(__name__)


class RedisService:
    """
    Redis service for caching and pub/sub functionality.
    Used for:
    - Caching market data
    - Rate limiting API calls
    - Session management
    - Real-time updates
    """
    
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
        self.url = settings.redis_url
    
    async def connect(self) -> None:
        """Connect to Redis"""
        try:
            self.redis = redis.from_url(
                self.url,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis.ping()
            logger.info("✅ Connected to Redis")
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {e}. Running without cache.")
            self.redis = None
    
    async def disconnect(self) -> None:
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
            logger.info("Disconnected from Redis")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis:
            return None
        
        try:
            value = await self.redis.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expire_seconds: int = 300
    ) -> bool:
        """Set value in cache with expiration"""
        if not self.redis:
            return False
        
        try:
            await self.redis.setex(
                key, 
                expire_seconds, 
                json.dumps(value)
            )
            return True
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.redis:
            return False
        
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis delete error: {e}")
            return False
    
    async def increment(self, key: str, expire_seconds: int = 60) -> int:
        """Increment a counter (for rate limiting)"""
        if not self.redis:
            return 0
        
        try:
            pipe = self.redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, expire_seconds)
            results = await pipe.execute()
            return results[0]
        except Exception as e:
            logger.error(f"Redis increment error: {e}")
            return 0
    
    async def is_rate_limited(
        self, 
        identifier: str, 
        max_requests: int = 100,
        window_seconds: int = 60
    ) -> bool:
        """Check if identifier is rate limited"""
        key = f"rate_limit:{identifier}"
        count = await self.increment(key, window_seconds)
        return count > max_requests
    
    async def publish(self, channel: str, message: Any) -> None:
        """Publish message to channel"""
        if not self.redis:
            return
        
        try:
            await self.redis.publish(channel, json.dumps(message))
        except Exception as e:
            logger.error(f"Redis publish error: {e}")
    
    async def subscribe(self, channel: str):
        """Subscribe to channel"""
        if not self.redis:
            return None
        
        try:
            pubsub = self.redis.pubsub()
            await pubsub.subscribe(channel)
            return pubsub
        except Exception as e:
            logger.error(f"Redis subscribe error: {e}")
            return None
    
    # ============ Specific Cache Methods ============
    
    async def cache_quote(self, symbol: str, data: dict) -> None:
        """Cache market quote with 1 minute expiry"""
        key = f"quote:{symbol}"
        await self.set(key, data, expire_seconds=60)
    
    async def get_cached_quote(self, symbol: str) -> Optional[dict]:
        """Get cached market quote"""
        key = f"quote:{symbol}"
        return await self.get(key)
    
    async def cache_prediction(self, symbol: str, data: dict) -> None:
        """Cache prediction with 5 minute expiry"""
        key = f"prediction:{symbol}"
        await self.set(key, data, expire_seconds=300)
    
    async def get_cached_prediction(self, symbol: str) -> Optional[dict]:
        """Get cached prediction"""
        key = f"prediction:{symbol}"
        return await self.get(key)
    
    async def store_session(self, session_id: str, data: dict) -> None:
        """Store user session with 1 hour expiry"""
        key = f"session:{session_id}"
        await self.set(key, data, expire_seconds=3600)
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        """Get user session"""
        key = f"session:{session_id}"
        return await self.get(key)
