"""
Prediction Service
Aggregates predictions from multiple models
"""

from typing import List, Optional, Dict
from datetime import datetime
import logging
import random

from services.market_service import MarketService


logger = logging.getLogger(__name__)


class PredictionService:
    """
    Service for aggregating predictions from multiple ML models.
    This orchestrates various prediction models and combines their outputs.
    """
    
    def __init__(self):
        self.market_service = MarketService()
        
        # Model configurations (in production, these would be actual model endpoints)
        self.models = {
            "lstm_price": {
                "name": "LSTM Price Predictor",
                "type": "price",
                "weight": 0.25,
                "accuracy_30d": 0.72
            },
            "finbert_sentiment": {
                "name": "FinBERT Sentiment",
                "type": "sentiment",
                "weight": 0.20,
                "accuracy_30d": 0.81
            },
            "technical_ensemble": {
                "name": "Technical Indicator Ensemble",
                "type": "technical",
                "weight": 0.25,
                "accuracy_30d": 0.68
            },
            "garch_volatility": {
                "name": "GARCH Volatility",
                "type": "volatility",
                "weight": 0.15,
                "accuracy_30d": 0.74
            },
            "social_momentum": {
                "name": "Social Momentum",
                "type": "sentiment",
                "weight": 0.15,
                "accuracy_30d": 0.65
            }
        }
    
    async def get_aggregated_prediction(
        self, 
        symbol: str, 
        horizon: str = "1d"
    ) -> Dict:
        """
        Get aggregated prediction from all models for a symbol.
        
        The aggregation logic:
        1. Run each model to get individual predictions
        2. Weight predictions by model accuracy
        3. Calculate consensus direction and confidence
        4. Generate suggested action based on consensus and risk
        """
        try:
            # Get predictions from each model
            predictions = await self._run_all_models(symbol, horizon)
            
            # Calculate consensus
            consensus = self._calculate_consensus(predictions)
            
            # Determine suggested action
            suggested_action = self._determine_action(consensus)
            
            # Assess risk level
            risk_level = self._assess_risk_level(predictions, consensus)
            
            return {
                "symbol": symbol,
                "asset_type": self._get_asset_type(symbol),
                "timestamp": datetime.now(),
                "predictions": predictions,
                "consensus": consensus,
                "suggested_action": suggested_action,
                "risk_level": risk_level,
                "confidence_weighted_score": consensus["weighted_confidence"]
            }
        except Exception as e:
            logger.error(f"Error getting prediction for {symbol}: {e}")
            raise
    
    async def _run_all_models(self, symbol: str, horizon: str) -> List[Dict]:
        """Run all prediction models"""
        predictions = []
        
        for model_id, model_config in self.models.items():
            try:
                prediction = await self._run_model(model_id, model_config, symbol, horizon)
                predictions.append(prediction)
            except Exception as e:
                logger.error(f"Model {model_id} failed for {symbol}: {e}")
        
        return predictions
    
    async def _run_model(
        self, 
        model_id: str, 
        model_config: Dict,
        symbol: str, 
        horizon: str
    ) -> Dict:
        """
        Run a single prediction model.
        In production, this would call actual model endpoints or run inference.
        """
        # Simulate model prediction (replace with actual model calls)
        direction_options = ["bullish", "bearish", "neutral"]
        direction_weights = [0.4, 0.3, 0.3]  # Slightly bullish bias for demo
        
        # Use deterministic random based on symbol for consistent demo
        seed = hash(f"{symbol}_{model_id}_{horizon}") % 1000
        random.seed(seed)
        
        direction = random.choices(direction_options, weights=direction_weights)[0]
        confidence = random.uniform(0.55, 0.85)
        
        # Add some model-specific logic
        if model_config["type"] == "volatility":
            direction = "neutral"  # Volatility models don't predict direction
            
        return {
            "model_name": model_config["name"],
            "model_type": model_config["type"],
            "direction": direction,
            "confidence": round(confidence, 2),
            "prediction_value": None,  # Would be actual price prediction
            "horizon": horizon,
            "features_used": self._get_features_for_model(model_config["type"])
        }
    
    def _get_features_for_model(self, model_type: str) -> List[str]:
        """Get list of features used by each model type"""
        features = {
            "price": ["historical_prices", "volume", "moving_averages", "momentum"],
            "sentiment": ["news_headlines", "social_media", "analyst_ratings"],
            "technical": ["rsi", "macd", "bollinger_bands", "support_resistance"],
            "volatility": ["historical_volatility", "implied_volatility", "vix_correlation"]
        }
        return features.get(model_type, [])
    
    def _calculate_consensus(self, predictions: List[Dict]) -> Dict:
        """Calculate weighted consensus from all predictions"""
        if not predictions:
            return {
                "direction": "neutral",
                "confidence": 0.0,
                "weighted_confidence": 0.0,
                "agreement_level": "none"
            }
        
        # Count directions
        direction_scores = {"bullish": 0, "bearish": 0, "neutral": 0}
        total_weight = 0
        
        for pred in predictions:
            model_config = next(
                (m for m in self.models.values() if m["name"] == pred["model_name"]),
                {"weight": 0.2}
            )
            weight = model_config["weight"] * pred["confidence"]
            direction_scores[pred["direction"]] += weight
            total_weight += weight
        
        # Normalize scores
        if total_weight > 0:
            for key in direction_scores:
                direction_scores[key] /= total_weight
        
        # Determine consensus direction
        consensus_direction = max(direction_scores, key=direction_scores.get)
        consensus_confidence = direction_scores[consensus_direction]
        
        # Calculate agreement level
        max_score = max(direction_scores.values())
        if max_score > 0.7:
            agreement = "strong"
        elif max_score > 0.5:
            agreement = "moderate"
        else:
            agreement = "weak"
        
        # Calculate weighted confidence
        weighted_confidence = sum(
            pred["confidence"] * self.models.get(
                self._get_model_id(pred["model_name"]), 
                {"weight": 0.2}
            )["weight"]
            for pred in predictions
        )
        
        return {
            "direction": consensus_direction,
            "confidence": round(consensus_confidence, 2),
            "weighted_confidence": round(weighted_confidence, 2),
            "agreement_level": agreement,
            "direction_scores": direction_scores
        }
    
    def _get_model_id(self, model_name: str) -> str:
        """Get model ID from name"""
        for model_id, config in self.models.items():
            if config["name"] == model_name:
                return model_id
        return ""
    
    def _determine_action(self, consensus: Dict) -> str:
        """Determine suggested action based on consensus"""
        direction = consensus["direction"]
        confidence = consensus["confidence"]
        agreement = consensus["agreement_level"]
        
        if agreement == "weak" or confidence < 0.5:
            return "hold"
        
        if direction == "bullish":
            if confidence > 0.7 and agreement == "strong":
                return "buy"
            return "partial_buy"
        elif direction == "bearish":
            if confidence > 0.7 and agreement == "strong":
                return "sell"
            return "partial_sell"
        
        return "hold"
    
    def _assess_risk_level(self, predictions: List[Dict], consensus: Dict) -> str:
        """Assess risk level based on predictions and consensus"""
        # Check for volatility predictions
        vol_predictions = [p for p in predictions if p["model_type"] == "volatility"]
        
        # Check agreement level
        if consensus["agreement_level"] == "weak":
            return "high"
        
        # Check confidence spread
        confidences = [p["confidence"] for p in predictions]
        if confidences:
            confidence_spread = max(confidences) - min(confidences)
            if confidence_spread > 0.3:
                return "high"
        
        if consensus["confidence"] > 0.7:
            return "low"
        elif consensus["confidence"] > 0.5:
            return "medium"
        
        return "high"
    
    def _get_asset_type(self, symbol: str) -> str:
        """Determine if symbol is stock or crypto"""
        crypto_symbols = ["BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "DOT", "MATIC", "LINK", "AVAX"]
        return "crypto" if symbol.upper() in crypto_symbols else "stock"
    
    async def get_bulk_predictions(
        self, 
        symbols: List[str], 
        horizon: str = "1d"
    ) -> List[Dict]:
        """Get predictions for multiple symbols"""
        predictions = []
        for symbol in symbols:
            try:
                pred = await self.get_aggregated_prediction(symbol, horizon)
                predictions.append(pred)
            except:
                pass
        return predictions
    
    async def get_top_picks(
        self, 
        asset_type: Optional[str] = None,
        direction: str = "bullish",
        min_confidence: float = 0.7,
        limit: int = 10
    ) -> List[Dict]:
        """Get top picks based on prediction confidence"""
        # In production, this would query a database of recent predictions
        # For demo, we'll generate some picks
        
        sample_stocks = ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA", "META", "AMZN"]
        sample_crypto = ["BTC", "ETH", "SOL", "AVAX", "MATIC"]
        
        if asset_type == "stock":
            symbols = sample_stocks
        elif asset_type == "crypto":
            symbols = sample_crypto
        else:
            symbols = sample_stocks + sample_crypto
        
        predictions = await self.get_bulk_predictions(symbols[:limit])
        
        # Filter by direction and confidence
        filtered = [
            p for p in predictions
            if p["consensus"]["direction"] == direction
            and p["consensus"]["confidence"] >= min_confidence
        ]
        
        # Sort by confidence
        sorted_picks = sorted(
            filtered, 
            key=lambda x: x["confidence_weighted_score"], 
            reverse=True
        )
        
        return sorted_picks[:limit]
    
    async def get_model_performance(self, model_name: str) -> Dict:
        """Get detailed performance metrics for a model"""
        # In production, this would fetch actual backtested performance
        return {
            "model_name": model_name,
            "accuracy_7d": 0.68,
            "accuracy_30d": 0.72,
            "accuracy_90d": 0.70,
            "precision": 0.75,
            "recall": 0.69,
            "f1_score": 0.72,
            "sharpe_ratio": 1.45,
            "max_drawdown": -0.12,
            "total_predictions": 1250,
            "last_updated": datetime.now()
        }
    
    async def get_prediction_history(
        self, 
        symbol: str, 
        days: int = 30,
        model: Optional[str] = None
    ) -> Dict:
        """Get historical predictions and outcomes"""
        # In production, this would fetch from database
        return {
            "symbol": symbol,
            "period_days": days,
            "predictions": [],
            "accuracy": 0.72,
            "message": "Historical prediction data would be here"
        }
