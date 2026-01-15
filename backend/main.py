"""
Crypt - AI-Powered Trading Analytics Platform
Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from api import market, predictions, agents, portfolio, auth
from services.redis_service import RedisService
from services.database import init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("🚀 Starting Crypt AI Trading Platform...")
    
    # Initialize database
    await init_db()
    
    # Initialize Redis
    redis = RedisService()
    await redis.connect()
    app.state.redis = redis
    
    logger.info("✅ All services initialized successfully")
    
    yield
    
    # Cleanup
    await redis.disconnect()
    logger.info("👋 Shutting down Crypt Platform...")


# Create FastAPI app
app = FastAPI(
    title="Crypt AI Trading API",
    description="AI-Powered Financial Trading Analytics Platform with Multi-Agent System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://crypt.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(market.router, prefix="/api/market", tags=["Market Data"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Model Predictions"])
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Crypt AI Trading Platform",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/api/docs"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            "database": "operational",
            "redis": "operational",
            "agents": "operational"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
