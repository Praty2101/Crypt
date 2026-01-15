"""
Model Predictions API Router
Endpoints for multi-model aggregation and predictions
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from services.prediction_service import PredictionService


router = APIRouter()
prediction_service = PredictionService()


class PredictionResult(BaseModel):
    """Single model prediction result"""
    model_name: str
    model_type: str  # price, sentiment, technical, volatility
    direction: str  # bullish, bearish, neutral
    confidence: float
    prediction_value: Optional[float] = None
    horizon: str  # 1d, 1w, 1m
    features_used: List[str]


class AggregatedPrediction(BaseModel):
    """Aggregated prediction from multiple models"""
    symbol: str
    asset_type: str
    timestamp: datetime
    predictions: List[PredictionResult]
    consensus: dict
    suggested_action: str
    risk_level: str
    confidence_weighted_score: float


class BulkPredictionRequest(BaseModel):
    """Request for bulk predictions"""
    symbols: List[str]
    horizon: str = "1d"


class ModelInfo(BaseModel):
    """Model information"""
    name: str
    type: str
    description: str
    accuracy_30d: float
    last_updated: datetime


@router.get("/asset/{symbol}", response_model=AggregatedPrediction)
async def get_asset_prediction(
    symbol: str,
    horizon: str = Query("1d", description="Prediction horizon: 1d, 1w, 1m")
):
    """
    Get aggregated prediction for a specific asset.
    Combines predictions from multiple models:
    - Price prediction models
    - Sentiment analysis models
    - Technical indicator models
    - Volatility prediction models
    """
    try:
        prediction = await prediction_service.get_aggregated_prediction(
            symbol=symbol.upper(),
            horizon=horizon
        )
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk", response_model=List[AggregatedPrediction])
async def get_bulk_predictions(request: BulkPredictionRequest):
    """Get predictions for multiple assets at once"""
    if len(request.symbols) > 20:
        raise HTTPException(
            status_code=400,
            detail="Maximum 20 symbols allowed per request"
        )
    
    try:
        predictions = await prediction_service.get_bulk_predictions(
            symbols=[s.upper() for s in request.symbols],
            horizon=request.horizon
        )
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-picks")
async def get_top_picks(
    asset_type: Optional[str] = Query(None, description="Filter: stock, crypto"),
    direction: str = Query("bullish", description="Filter: bullish, bearish"),
    min_confidence: float = Query(0.7, description="Minimum confidence threshold"),
    limit: int = Query(10, description="Number of results")
):
    """
    Get top asset picks based on model consensus.
    Returns assets with highest confidence predictions.
    """
    try:
        picks = await prediction_service.get_top_picks(
            asset_type=asset_type,
            direction=direction,
            min_confidence=min_confidence,
            limit=limit
        )
        return {"picks": picks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models", response_model=List[ModelInfo])
async def list_prediction_models():
    """List all prediction models and their performance metrics"""
    return [
        {
            "name": "LSTM Price Predictor",
            "type": "price",
            "description": "Deep learning model for price movement prediction",
            "accuracy_30d": 0.72,
            "last_updated": datetime.now()
        },
        {
            "name": "FinBERT Sentiment",
            "type": "sentiment",
            "description": "BERT-based financial sentiment analysis",
            "accuracy_30d": 0.81,
            "last_updated": datetime.now()
        },
        {
            "name": "Technical Indicator Ensemble",
            "type": "technical",
            "description": "Ensemble of RSI, MACD, Bollinger Bands, etc.",
            "accuracy_30d": 0.68,
            "last_updated": datetime.now()
        },
        {
            "name": "GARCH Volatility",
            "type": "volatility",
            "description": "GARCH model for volatility prediction",
            "accuracy_30d": 0.74,
            "last_updated": datetime.now()
        },
        {
            "name": "Social Momentum",
            "type": "sentiment",
            "description": "Reddit/Twitter social sentiment tracker",
            "accuracy_30d": 0.65,
            "last_updated": datetime.now()
        }
    ]


@router.get("/models/{model_name}/performance")
async def get_model_performance(model_name: str):
    """Get detailed performance metrics for a specific model"""
    try:
        performance = await prediction_service.get_model_performance(model_name)
        return performance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{symbol}")
async def get_prediction_history(
    symbol: str,
    days: int = Query(30, description="Number of days of history"),
    model: Optional[str] = Query(None, description="Filter by specific model")
):
    """Get historical predictions and their accuracy for backtesting"""
    try:
        history = await prediction_service.get_prediction_history(
            symbol=symbol.upper(),
            days=days,
            model=model
        )
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
