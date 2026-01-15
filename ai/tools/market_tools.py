"""
AI Tools
LangChain tools for agents to use
"""

from typing import Optional, Type
from pydantic import BaseModel, Field
from langchain.tools import BaseTool
import yfinance as yf


# ============ Tool Schemas ============

class StockPriceInput(BaseModel):
    """Input for stock price lookup"""
    symbol: str = Field(description="Stock ticker symbol (e.g., AAPL, MSFT)")


class CryptoInput(BaseModel):
    """Input for crypto lookup"""
    symbol: str = Field(description="Crypto symbol (e.g., BTC, ETH)")


class TechnicalAnalysisInput(BaseModel):
    """Input for technical analysis"""
    symbol: str = Field(description="Asset symbol")
    indicator: str = Field(description="Technical indicator (rsi, macd, bollinger)")


class NewsSearchInput(BaseModel):
    """Input for news search"""
    query: str = Field(description="Search query for financial news")
    limit: int = Field(default=5, description="Number of results")


# ============ Tools ============

class StockPriceTool(BaseTool):
    """Tool for fetching current stock prices"""
    name: str = "stock_price"
    description: str = "Get current stock price and basic info for a given ticker symbol"
    args_schema: Type[BaseModel] = StockPriceInput
    
    def _run(self, symbol: str) -> str:
        """Fetch stock price"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            price = info.get("currentPrice", info.get("regularMarketPrice", "N/A"))
            change = info.get("regularMarketChange", 0)
            change_pct = info.get("regularMarketChangePercent", 0)
            
            return f"""
Stock: {symbol}
Current Price: ${price}
Change: ${change:.2f} ({change_pct:.2f}%)
Day Range: ${info.get('dayLow', 'N/A')} - ${info.get('dayHigh', 'N/A')}
52W Range: ${info.get('fiftyTwoWeekLow', 'N/A')} - ${info.get('fiftyTwoWeekHigh', 'N/A')}
Volume: {info.get('volume', 'N/A'):,}
Market Cap: ${info.get('marketCap', 'N/A'):,}
"""
        except Exception as e:
            return f"Error fetching stock data: {str(e)}"
    
    async def _arun(self, symbol: str) -> str:
        return self._run(symbol)


class TechnicalIndicatorTool(BaseTool):
    """Tool for calculating technical indicators"""
    name: str = "technical_indicator"
    description: str = "Calculate technical indicators (RSI, MACD, Bollinger Bands) for a stock"
    args_schema: Type[BaseModel] = TechnicalAnalysisInput
    
    def _run(self, symbol: str, indicator: str) -> str:
        """Calculate technical indicator"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="3mo")
            
            if indicator.lower() == "rsi":
                return self._calculate_rsi(hist, symbol)
            elif indicator.lower() == "macd":
                return self._calculate_macd(hist, symbol)
            elif indicator.lower() == "bollinger":
                return self._calculate_bollinger(hist, symbol)
            else:
                return f"Unknown indicator: {indicator}. Supported: rsi, macd, bollinger"
        except Exception as e:
            return f"Error calculating indicator: {str(e)}"
    
    def _calculate_rsi(self, hist, symbol: str, period: int = 14) -> str:
        """Calculate RSI"""
        delta = hist['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        current_rsi = rsi.iloc[-1]
        
        signal = "Neutral"
        if current_rsi > 70:
            signal = "Overbought (potential sell signal)"
        elif current_rsi < 30:
            signal = "Oversold (potential buy signal)"
        
        return f"""
RSI Analysis for {symbol}:
Current RSI (14): {current_rsi:.2f}
Signal: {signal}
Interpretation: RSI measures momentum. Above 70 = overbought, Below 30 = oversold.
"""
    
    def _calculate_macd(self, hist, symbol: str) -> str:
        """Calculate MACD"""
        exp1 = hist['Close'].ewm(span=12, adjust=False).mean()
        exp2 = hist['Close'].ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        histogram = macd - signal
        
        current_macd = macd.iloc[-1]
        current_signal = signal.iloc[-1]
        current_hist = histogram.iloc[-1]
        
        trend = "Bullish" if current_macd > current_signal else "Bearish"
        
        return f"""
MACD Analysis for {symbol}:
MACD Line: {current_macd:.4f}
Signal Line: {current_signal:.4f}
Histogram: {current_hist:.4f}
Trend: {trend}
Interpretation: MACD above signal line = bullish momentum
"""
    
    def _calculate_bollinger(self, hist, symbol: str, period: int = 20) -> str:
        """Calculate Bollinger Bands"""
        sma = hist['Close'].rolling(window=period).mean()
        std = hist['Close'].rolling(window=period).std()
        upper = sma + (std * 2)
        lower = sma - (std * 2)
        
        current_price = hist['Close'].iloc[-1]
        current_upper = upper.iloc[-1]
        current_lower = lower.iloc[-1]
        current_sma = sma.iloc[-1]
        
        position = "within bands"
        if current_price > current_upper:
            position = "above upper band (potentially overbought)"
        elif current_price < current_lower:
            position = "below lower band (potentially oversold)"
        
        return f"""
Bollinger Bands for {symbol}:
Current Price: ${current_price:.2f}
Upper Band: ${current_upper:.2f}
Middle (SMA20): ${current_sma:.2f}
Lower Band: ${current_lower:.2f}
Position: Price is {position}
"""
    
    async def _arun(self, symbol: str, indicator: str) -> str:
        return self._run(symbol, indicator)


class StockHistoryTool(BaseTool):
    """Tool for fetching historical stock data"""
    name: str = "stock_history"
    description: str = "Get historical price data for a stock"
    args_schema: Type[BaseModel] = StockPriceInput
    
    def _run(self, symbol: str) -> str:
        """Fetch stock history"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1mo")
            
            if hist.empty:
                return f"No historical data available for {symbol}"
            
            # Calculate basic stats
            current = hist['Close'].iloc[-1]
            month_ago = hist['Close'].iloc[0]
            change = ((current - month_ago) / month_ago) * 100
            high = hist['High'].max()
            low = hist['Low'].min()
            avg_volume = hist['Volume'].mean()
            
            return f"""
{symbol} - 1 Month Summary:
Current: ${current:.2f}
1M Change: {change:.2f}%
Period High: ${high:.2f}
Period Low: ${low:.2f}
Avg Daily Volume: {avg_volume:,.0f}
"""
        except Exception as e:
            return f"Error fetching history: {str(e)}"
    
    async def _arun(self, symbol: str) -> str:
        return self._run(symbol)


# ============ Tool Registry ============

def get_market_analysis_tools():
    """Get tools for market analysis"""
    return [
        StockPriceTool(),
        TechnicalIndicatorTool(),
        StockHistoryTool()
    ]


def get_all_tools():
    """Get all available tools"""
    return get_market_analysis_tools()
