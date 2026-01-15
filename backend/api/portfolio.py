"""
Portfolio API Router
Endpoints for portfolio management and tracking
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from services.portfolio_service import PortfolioService
from api.auth import get_current_user


router = APIRouter()
portfolio_service = PortfolioService()


class Holding(BaseModel):
    """Portfolio holding model"""
    symbol: str
    name: str
    asset_type: str  # stock, crypto
    quantity: float
    average_cost: float
    current_price: float
    current_value: float
    profit_loss: float
    profit_loss_percent: float
    allocation_percent: float


class PortfolioSummary(BaseModel):
    """Portfolio summary model"""
    total_value: float
    total_cost: float
    total_profit_loss: float
    total_profit_loss_percent: float
    day_change: float
    day_change_percent: float
    diversification_score: float
    risk_score: float
    holdings: List[Holding]
    allocation_by_type: dict
    allocation_by_sector: dict


class AddHoldingRequest(BaseModel):
    """Request to add a holding"""
    symbol: str
    quantity: float
    purchase_price: float
    purchase_date: Optional[datetime] = None
    notes: Optional[str] = None


class TransactionRecord(BaseModel):
    """Transaction record model"""
    id: str
    symbol: str
    transaction_type: str  # buy, sell
    quantity: float
    price: float
    total_value: float
    timestamp: datetime
    notes: Optional[str] = None


@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(user_id: str = Depends(get_current_user)):
    """Get comprehensive portfolio summary with all holdings and metrics"""
    try:
        summary = await portfolio_service.get_portfolio_summary(user_id)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/holdings", response_model=List[Holding])
async def get_holdings(
    user_id: str = Depends(get_current_user),
    asset_type: Optional[str] = Query(None, description="Filter by type: stock, crypto")
):
    """Get all portfolio holdings"""
    try:
        holdings = await portfolio_service.get_holdings(user_id, asset_type)
        return holdings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/holdings")
async def add_holding(
    request: AddHoldingRequest,
    user_id: str = Depends(get_current_user)
):
    """Add a new holding to the portfolio"""
    try:
        result = await portfolio_service.add_holding(
            user_id=user_id,
            symbol=request.symbol.upper(),
            quantity=request.quantity,
            purchase_price=request.purchase_price,
            purchase_date=request.purchase_date,
            notes=request.notes
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/holdings/{symbol}")
async def remove_holding(
    symbol: str,
    user_id: str = Depends(get_current_user)
):
    """Remove a holding from the portfolio"""
    try:
        await portfolio_service.remove_holding(user_id, symbol.upper())
        return {"message": f"Holding {symbol} removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/transactions", response_model=List[TransactionRecord])
async def get_transactions(
    user_id: str = Depends(get_current_user),
    symbol: Optional[str] = Query(None),
    limit: int = Query(50, le=100)
):
    """Get portfolio transaction history"""
    try:
        transactions = await portfolio_service.get_transactions(
            user_id, symbol, limit
        )
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance")
async def get_performance(
    user_id: str = Depends(get_current_user),
    period: str = Query("1m", description="Period: 1d, 1w, 1m, 3m, 6m, 1y, all")
):
    """Get portfolio performance over time"""
    try:
        performance = await portfolio_service.get_performance(user_id, period)
        return performance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_portfolio_analytics(user_id: str = Depends(get_current_user)):
    """
    Get advanced portfolio analytics including:
    - Risk metrics (beta, volatility, Sharpe ratio)
    - Correlation analysis
    - Sector exposure
    - Diversification analysis
    """
    try:
        analytics = await portfolio_service.get_analytics(user_id)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rebalance-suggestions")
async def get_rebalance_suggestions(
    user_id: str = Depends(get_current_user),
    target_strategy: str = Query("balanced", description="Strategy: conservative, balanced, aggressive")
):
    """
    Get AI-powered rebalancing suggestions based on:
    - Current allocation vs target
    - Risk profile
    - Market conditions
    - Model predictions
    """
    try:
        suggestions = await portfolio_service.get_rebalance_suggestions(
            user_id, target_strategy
        )
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/watchlist")
async def get_watchlist(user_id: str = Depends(get_current_user)):
    """Get user's watchlist with current prices and predictions"""
    try:
        watchlist = await portfolio_service.get_watchlist(user_id)
        return watchlist
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/watchlist/{symbol}")
async def add_to_watchlist(
    symbol: str,
    user_id: str = Depends(get_current_user)
):
    """Add an asset to watchlist"""
    try:
        await portfolio_service.add_to_watchlist(user_id, symbol.upper())
        return {"message": f"{symbol} added to watchlist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/watchlist/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    user_id: str = Depends(get_current_user)
):
    """Remove an asset from watchlist"""
    try:
        await portfolio_service.remove_from_watchlist(user_id, symbol.upper())
        return {"message": f"{symbol} removed from watchlist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
