"""
Market Data Service
Fetches stock and crypto data from various APIs
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import aiohttp
import yfinance as yf

from config import settings


logger = logging.getLogger(__name__)


class MarketService:
    """
    Service for fetching market data from various sources:
    - Yahoo Finance (stocks)
    - Alpha Vantage (additional stock data)
    - CoinGecko (crypto)
    - Binance (crypto trading data)
    """
    
    def __init__(self):
        self.alpha_vantage_key = settings.alpha_vantage_api_key
        self.coingecko_base_url = "https://api.coingecko.com/api/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        """Close the session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    # ============ Stock Data ============
    
    async def get_stock_quote(self, symbol: str) -> Dict:
        """Get current stock quote"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            return {
                "symbol": symbol,
                "name": info.get("longName", symbol),
                "price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
                "change_24h": info.get("regularMarketChange", 0),
                "change_percent": info.get("regularMarketChangePercent", 0),
                "volume": info.get("volume", 0),
                "market_cap": info.get("marketCap"),
                "high_24h": info.get("dayHigh", 0),
                "low_24h": info.get("dayLow", 0),
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error fetching stock quote for {symbol}: {e}")
            return None
    
    async def get_stock_history(
        self, 
        symbol: str, 
        interval: str = "1d",
        period: str = "1mo"
    ) -> List[Dict]:
        """Get historical stock data"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval)
            
            return [
                {
                    "timestamp": index.to_pydatetime(),
                    "open": row["Open"],
                    "high": row["High"],
                    "low": row["Low"],
                    "close": row["Close"],
                    "volume": row["Volume"]
                }
                for index, row in hist.iterrows()
            ]
        except Exception as e:
            logger.error(f"Error fetching stock history for {symbol}: {e}")
            return []
    
    # ============ Crypto Data ============
    
    async def get_crypto_quote(self, symbol: str) -> Dict:
        """Get current crypto quote from CoinGecko"""
        try:
            # Map common symbols to CoinGecko IDs
            symbol_map = {
                "BTC": "bitcoin",
                "ETH": "ethereum",
                "SOL": "solana",
                "XRP": "ripple",
                "ADA": "cardano",
                "DOGE": "dogecoin",
                "DOT": "polkadot",
                "MATIC": "matic-network",
                "LINK": "chainlink",
                "AVAX": "avalanche-2"
            }
            
            coin_id = symbol_map.get(symbol.upper(), symbol.lower())
            
            session = await self._get_session()
            url = f"{self.coingecko_base_url}/coins/{coin_id}"
            
            async with session.get(url) as response:
                if response.status != 200:
                    return None
                
                data = await response.json()
                market_data = data.get("market_data", {})
                
                return {
                    "symbol": symbol.upper(),
                    "name": data.get("name", symbol),
                    "price": market_data.get("current_price", {}).get("usd", 0),
                    "change_24h": market_data.get("price_change_24h", 0),
                    "change_percent": market_data.get("price_change_percentage_24h", 0),
                    "volume": market_data.get("total_volume", {}).get("usd", 0),
                    "market_cap": market_data.get("market_cap", {}).get("usd"),
                    "high_24h": market_data.get("high_24h", {}).get("usd", 0),
                    "low_24h": market_data.get("low_24h", {}).get("usd", 0),
                    "timestamp": datetime.now()
                }
        except Exception as e:
            logger.error(f"Error fetching crypto quote for {symbol}: {e}")
            return None
    
    async def get_crypto_history(
        self, 
        symbol: str, 
        days: int = 30,
        interval: str = "daily"
    ) -> List[Dict]:
        """Get historical crypto data from CoinGecko"""
        try:
            symbol_map = {
                "BTC": "bitcoin",
                "ETH": "ethereum",
                "SOL": "solana",
            }
            
            coin_id = symbol_map.get(symbol.upper(), symbol.lower())
            
            session = await self._get_session()
            url = f"{self.coingecko_base_url}/coins/{coin_id}/market_chart"
            params = {"vs_currency": "usd", "days": days}
            
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    return []
                
                data = await response.json()
                prices = data.get("prices", [])
                
                return [
                    {
                        "timestamp": datetime.fromtimestamp(p[0] / 1000),
                        "open": p[1],
                        "high": p[1],
                        "low": p[1],
                        "close": p[1],
                        "volume": 0
                    }
                    for p in prices
                ]
        except Exception as e:
            logger.error(f"Error fetching crypto history for {symbol}: {e}")
            return []
    
    # ============ Market Overview ============
    
    async def get_market_overview(self) -> Dict:
        """Get comprehensive market overview"""
        try:
            # Get major indices
            indices = []
            for symbol, name in [("^GSPC", "S&P 500"), ("^IXIC", "NASDAQ"), ("^DJI", "Dow Jones")]:
                try:
                    ticker = yf.Ticker(symbol)
                    info = ticker.info
                    indices.append({
                        "symbol": symbol,
                        "name": name,
                        "price": info.get("regularMarketPrice", 0),
                        "change": info.get("regularMarketChange", 0),
                        "change_percent": info.get("regularMarketChangePercent", 0)
                    })
                except:
                    pass
            
            # Get trending crypto
            session = await self._get_session()
            crypto_url = f"{self.coingecko_base_url}/coins/markets"
            params = {
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": 10,
                "page": 1
            }
            
            trending_crypto = []
            try:
                async with session.get(crypto_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        trending_crypto = [
                            {
                                "symbol": c["symbol"].upper(),
                                "name": c["name"],
                                "price": c["current_price"],
                                "change_24h": c["price_change_percentage_24h"]
                            }
                            for c in data[:5]
                        ]
            except:
                pass
            
            return {
                "indices": indices,
                "top_gainers": [],  # Would fetch from screener
                "top_losers": [],
                "trending_crypto": trending_crypto,
                "fear_greed_index": 55,  # Would fetch from API
                "market_sentiment": "neutral"
            }
        except Exception as e:
            logger.error(f"Error fetching market overview: {e}")
            raise
    
    # ============ Search & Utilities ============
    
    async def search_assets(
        self, 
        query: str, 
        asset_type: Optional[str] = None
    ) -> List[Dict]:
        """Search for stocks and crypto assets"""
        results = []
        
        # Search stocks via yfinance
        if not asset_type or asset_type == "stock":
            try:
                tickers = yf.Tickers(query)
                for symbol in query.upper().split():
                    try:
                        info = yf.Ticker(symbol).info
                        if info.get("quoteType"):
                            results.append({
                                "symbol": symbol,
                                "name": info.get("longName", symbol),
                                "type": "stock",
                                "exchange": info.get("exchange", "")
                            })
                    except:
                        pass
            except:
                pass
        
        # Search crypto
        if not asset_type or asset_type == "crypto":
            try:
                session = await self._get_session()
                url = f"{self.coingecko_base_url}/search"
                params = {"query": query}
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        for coin in data.get("coins", [])[:5]:
                            results.append({
                                "symbol": coin["symbol"].upper(),
                                "name": coin["name"],
                                "type": "crypto",
                                "exchange": "CoinGecko"
                            })
            except:
                pass
        
        return results
    
    async def calculate_volatility(self, symbol: str) -> Dict:
        """Calculate volatility metrics for an asset"""
        try:
            history = await self.get_stock_history(symbol, "1d", "3mo")
            
            if not history:
                return {"error": "No data available"}
            
            # Calculate returns
            closes = [h["close"] for h in history]
            returns = [(closes[i] - closes[i-1]) / closes[i-1] 
                      for i in range(1, len(closes))]
            
            # Calculate metrics
            import statistics
            
            daily_volatility = statistics.stdev(returns) if len(returns) > 1 else 0
            annualized_volatility = daily_volatility * (252 ** 0.5)
            
            return {
                "symbol": symbol,
                "daily_volatility": daily_volatility,
                "annualized_volatility": annualized_volatility,
                "volatility_percentile": 50,  # Would compare to universe
                "volatility_trend": "stable",
                "data_points": len(history)
            }
        except Exception as e:
            logger.error(f"Error calculating volatility for {symbol}: {e}")
            return {"error": str(e)}
