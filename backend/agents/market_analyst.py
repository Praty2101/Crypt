"""
Market Analyst Agent
Analyzes market trends, technical indicators, and price patterns
"""

from typing import Any, Dict, List, Optional
from datetime import datetime

from agents.base_agent import BaseAgent, AgentResponse
from services.market_service import MarketService


class MarketAnalystAgent(BaseAgent):
    """
    📈 Market Analyst Agent
    
    Specializes in:
    - Technical analysis (RSI, MACD, Bollinger Bands)
    - Trend identification
    - Support/resistance levels
    - Chart pattern recognition
    - Price action analysis
    """
    
    def __init__(self):
        super().__init__(
            agent_id="market_analyst",
            agent_name="📈 Market Analyst",
            role_description="""You are an expert market analyst specializing in technical analysis 
            and price action. You analyze charts, identify trends, and interpret technical indicators 
            to provide insights about market movements. You excel at recognizing chart patterns, 
            support/resistance levels, and momentum indicators.""",
            temperature=0.5  # More deterministic for technical analysis
        )
        self.market_service = MarketService()
    
    def _initialize_tools(self) -> List[Any]:
        """Initialize market analysis tools"""
        return [
            "fetch_price_data",
            "calculate_rsi",
            "calculate_macd",
            "identify_support_resistance",
            "detect_chart_patterns"
        ]
    
    async def analyze(self, query: str, context: Optional[Dict] = None) -> AgentResponse:
        """Perform market analysis"""
        # Get relevant market data
        enhanced_context = context or {}
        
        # Add technical analysis prompt
        analysis_prompt = f"""
        Analyze the following market query using technical analysis:
        
        Query: {query}
        
        Provide:
        1. Current trend analysis (bullish/bearish/neutral)
        2. Key technical indicators (RSI, MACD if relevant)
        3. Important support/resistance levels
        4. Any notable chart patterns
        5. Short-term outlook (1-5 days)
        6. Key price levels to watch
        
        Always quantify your confidence level and cite specific data points.
        """
        
        return await self.ask(analysis_prompt, enhanced_context)
    
    async def get_technical_summary(self, symbol: str) -> Dict:
        """Get technical analysis summary for a symbol"""
        try:
            # Fetch price data
            price_data = await self.market_service.get_stock_history(symbol, "1d", "1mo")
            
            # Calculate indicators (mock for now)
            indicators = {
                "rsi": 55.5,
                "rsi_signal": "neutral",
                "macd": {"macd": 1.23, "signal": 0.98, "histogram": 0.25},
                "macd_signal": "bullish",
                "sma_20": 150.25,
                "sma_50": 148.50,
                "sma_200": 142.00,
                "trend": "bullish",
                "bollinger": {
                    "upper": 158.00,
                    "middle": 150.25,
                    "lower": 142.50
                }
            }
            
            # Identify support/resistance
            levels = {
                "resistance": [155.00, 160.00, 165.00],
                "support": [145.00, 140.00, 135.00]
            }
            
            # Generate analysis
            analysis = await self.analyze(
                f"Analyze {symbol} based on current technical indicators",
                context={"indicators": indicators, "levels": levels}
            )
            
            return {
                "symbol": symbol,
                "indicators": indicators,
                "levels": levels,
                "analysis": analysis.response,
                "confidence": analysis.confidence,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    async def identify_trend(self, symbol: str, timeframe: str = "1d") -> Dict:
        """Identify the current trend for a symbol"""
        prompt = f"""
        Identify the current trend for {symbol} on the {timeframe} timeframe.
        
        Consider:
        - Price action relative to moving averages
        - Higher highs/lower lows pattern
        - Volume confirmation
        - Momentum indicators
        
        Classify as: Strong Uptrend, Uptrend, Sideways, Downtrend, Strong Downtrend
        """
        
        response = await self.ask(prompt)
        
        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "trend_analysis": response.response,
            "confidence": response.confidence
        }
    
    async def find_entry_points(self, symbol: str, direction: str = "long") -> Dict:
        """Find potential entry points for a position"""
        prompt = f"""
        Identify potential entry points for a {direction} position in {symbol}.
        
        Consider:
        - Support/resistance levels
        - Fibonacci retracements
        - Moving average tests
        - Oversold/overbought conditions
        
        Provide specific price levels with reasoning.
        """
        
        response = await self.ask(prompt)
        
        return {
            "symbol": symbol,
            "direction": direction,
            "entry_analysis": response.response,
            "confidence": response.confidence
        }
