"""
Market Data API Router
Endpoints for fetching stock and crypto market data
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, timedelta

from services.market_service import MarketService


router = APIRouter()
market_service = MarketService()


class MarketDataResponse(BaseModel):
    """Market data response model"""
    symbol: str
    name: str
    price: float
    change_24h: float
    change_percent: float
    volume: float
    market_cap: Optional[float] = None
    high_24h: float
    low_24h: float
    timestamp: datetime


class OHLCVData(BaseModel):
    """OHLCV candlestick data"""
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float


class MarketOverview(BaseModel):
    """Market overview data"""
    indices: List[dict]
    top_gainers: List[dict]
    top_losers: List[dict]
    trending_crypto: List[dict]
    fear_greed_index: int
    market_sentiment: str


@router.get("/overview", response_model=MarketOverview)
async def get_market_overview():
    """
    Get comprehensive market overview including:
    - Major indices (S&P 500, NIFTY, etc.)
    - Top gainers and losers
    - Trending crypto
    - Fear & Greed index
    """
    try:
        overview = await market_service.get_market_overview()
        return overview
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stocks/{symbol}", response_model=MarketDataResponse)
async def get_stock_data(symbol: str):
    """Get current stock data for a specific symbol"""
    try:
        data = await market_service.get_stock_quote(symbol.upper())
        if not data:
            raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/crypto/{symbol}", response_model=MarketDataResponse)
async def get_crypto_data(symbol: str):
    """Get current crypto data for a specific symbol (e.g., BTC, ETH)"""
    try:
        data = await market_service.get_crypto_quote(symbol.upper())
        if not data:
            raise HTTPException(status_code=404, detail=f"Crypto {symbol} not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stocks/{symbol}/history", response_model=List[OHLCVData])
async def get_stock_history(
    symbol: str,
    interval: str = Query("1d", description="Interval: 1m, 5m, 15m, 1h, 1d, 1wk, 1mo"),
    period: str = Query("1mo", description="Period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max")
):
    """Get historical OHLCV data for a stock"""
    try:
        data = await market_service.get_stock_history(symbol.upper(), interval, period)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/crypto/{symbol}/history", response_model=List[OHLCVData])
async def get_crypto_history(
    symbol: str,
    days: int = Query(30, description="Number of days of history"),
    interval: str = Query("daily", description="Interval: minutely, hourly, daily")
):
    """Get historical OHLCV data for crypto"""
    try:
        data = await market_service.get_crypto_history(symbol.upper(), days, interval)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_assets(
    query: str = Query(..., min_length=1, description="Search query"),
    asset_type: Optional[str] = Query(None, description="Filter by type: stock, crypto")
):
    """Search for stocks and crypto assets"""
    try:
        results = await market_service.search_assets(query, asset_type)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/volatility/{symbol}")
async def get_volatility_index(symbol: str):
    """Get volatility metrics for an asset"""
    try:
        volatility = await market_service.calculate_volatility(symbol.upper())
        return volatility
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
