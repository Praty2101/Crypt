"""
Database Service
PostgreSQL database initialization and connection
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey, JSON
from datetime import datetime
import logging

from config import settings


logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Base class for all database models"""
    pass


# ============ Models ============

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Portfolio(Base):
    """Portfolio model"""
    __tablename__ = "portfolios"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, default="Main Portfolio")
    created_at = Column(DateTime, default=datetime.utcnow)


class Holding(Base):
    """Portfolio holding model"""
    __tablename__ = "holdings"
    
    id = Column(String, primary_key=True)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=False)
    symbol = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    average_cost = Column(Float, nullable=False)
    asset_type = Column(String, default="stock")
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Transaction(Base):
    """Transaction record model"""
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=False)
    symbol = Column(String, nullable=False)
    transaction_type = Column(String, nullable=False)  # buy, sell
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(String)


class Watchlist(Base):
    """Watchlist model"""
    __tablename__ = "watchlists"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    symbol = Column(String, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    """Stored prediction for backtesting"""
    __tablename__ = "predictions"
    
    id = Column(String, primary_key=True)
    symbol = Column(String, nullable=False)
    prediction_type = Column(String, nullable=False)
    direction = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    model_name = Column(String, nullable=False)
    horizon = Column(String, nullable=False)
    prediction_data = Column(JSON)
    actual_outcome = Column(String)  # Filled in later for backtesting
    was_correct = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentSession(Base):
    """Agent chat session"""
    __tablename__ = "agent_sessions"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    messages = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============ Database Setup ============

# Format Database URL to use asyncpg for Render compatibility
db_url = settings.database_url
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    db_url,
    echo=settings.debug,
    future=True
)

# Create session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_db():
    """Initialize database tables"""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ Database initialization failed: {e}. Some features may be limited.")


async def get_session() -> AsyncSession:
    """Get database session"""
    async with async_session() as session:
        yield session
