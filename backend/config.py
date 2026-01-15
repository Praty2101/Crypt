"""
Configuration settings for Crypt Trading Platform
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application Settings"""
    
    # App
    app_name: str = "Crypt AI Trading Platform"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/crypt_db"
    redis_url: str = "redis://localhost:6379"
    
    # Authentication
    jwt_secret_key: str = "your-super-secret-jwt-key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # OpenAI
    openai_api_key: str = ""
    
    # Market Data APIs
    alpha_vantage_api_key: str = ""
    coingecko_api_key: str = ""
    binance_api_key: str = ""
    binance_secret_key: str = ""
    
    # News APIs
    news_api_key: str = ""
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "crypt-trading-bot/1.0"
    
    # HuggingFace
    huggingface_api_key: str = ""
    
    # Clerk
    clerk_secret_key: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
