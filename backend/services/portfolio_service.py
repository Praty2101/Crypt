"""
Portfolio Service
Manages user portfolios and calculations
"""

from typing import List, Optional, Dict
from datetime import datetime
import logging

from services.market_service import MarketService


logger = logging.getLogger(__name__)


class PortfolioService:
    """
    Service for managing user portfolios.
    Handles holdings tracking, P/L calculations, and analytics.
    """
    
    def __init__(self):
        self.market_service = MarketService()
        
        # In production, this would be connected to a database
        # For demo, we use in-memory storage
        self._portfolios: Dict[str, Dict] = {}
        self._watchlists: Dict[str, List[str]] = {}
    
    async def get_portfolio_summary(self, user_id: str) -> Dict:
        """Get comprehensive portfolio summary"""
        portfolio = self._get_or_create_portfolio(user_id)
        holdings = portfolio.get("holdings", [])
        
        if not holdings:
            return {
                "total_value": 0,
                "total_cost": 0,
                "total_profit_loss": 0,
                "total_profit_loss_percent": 0,
                "day_change": 0,
                "day_change_percent": 0,
                "diversification_score": 0,
                "risk_score": 0,
                "holdings": [],
                "allocation_by_type": {},
                "allocation_by_sector": {}
            }
        
        # Update current prices
        updated_holdings = await self._update_holding_prices(holdings)
        
        # Calculate totals
        total_value = sum(h["current_value"] for h in updated_holdings)
        total_cost = sum(h["quantity"] * h["average_cost"] for h in updated_holdings)
        total_pnl = total_value - total_cost
        
        # Calculate allocations
        allocation_by_type = {}
        for h in updated_holdings:
            asset_type = h.get("asset_type", "stock")
            allocation_by_type[asset_type] = allocation_by_type.get(asset_type, 0) + h["current_value"]
        
        # Normalize allocations
        if total_value > 0:
            allocation_by_type = {k: v / total_value for k, v in allocation_by_type.items()}
        
        return {
            "total_value": total_value,
            "total_cost": total_cost,
            "total_profit_loss": total_pnl,
            "total_profit_loss_percent": (total_pnl / total_cost * 100) if total_cost > 0 else 0,
            "day_change": 0,  # Would calculate from yesterday's close
            "day_change_percent": 0,
            "diversification_score": self._calculate_diversification_score(updated_holdings),
            "risk_score": self._calculate_risk_score(updated_holdings),
            "holdings": updated_holdings,
            "allocation_by_type": allocation_by_type,
            "allocation_by_sector": {}  # Would fetch sector data
        }
    
    async def get_holdings(
        self, 
        user_id: str, 
        asset_type: Optional[str] = None
    ) -> List[Dict]:
        """Get all portfolio holdings"""
        portfolio = self._get_or_create_portfolio(user_id)
        holdings = portfolio.get("holdings", [])
        
        # Update prices
        holdings = await self._update_holding_prices(holdings)
        
        # Filter by type if specified
        if asset_type:
            holdings = [h for h in holdings if h.get("asset_type") == asset_type]
        
        return holdings
    
    async def add_holding(
        self, 
        user_id: str,
        symbol: str,
        quantity: float,
        purchase_price: float,
        purchase_date: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> Dict:
        """Add a new holding to the portfolio"""
        portfolio = self._get_or_create_portfolio(user_id)
        
        # Check if holding already exists
        existing = next(
            (h for h in portfolio["holdings"] if h["symbol"] == symbol),
            None
        )
        
        if existing:
            # Update existing holding (average in)
            total_quantity = existing["quantity"] + quantity
            total_cost = (existing["quantity"] * existing["average_cost"]) + (quantity * purchase_price)
            existing["quantity"] = total_quantity
            existing["average_cost"] = total_cost / total_quantity
        else:
            # Add new holding
            asset_type = self._get_asset_type(symbol)
            
            new_holding = {
                "symbol": symbol,
                "name": symbol,  # Would fetch real name
                "asset_type": asset_type,
                "quantity": quantity,
                "average_cost": purchase_price,
                "current_price": purchase_price,
                "current_value": quantity * purchase_price,
                "profit_loss": 0,
                "profit_loss_percent": 0,
                "allocation_percent": 0,
                "purchase_date": purchase_date or datetime.now(),
                "notes": notes
            }
            portfolio["holdings"].append(new_holding)
        
        # Add transaction record
        portfolio["transactions"].append({
            "id": f"txn_{len(portfolio['transactions'])+1}",
            "symbol": symbol,
            "transaction_type": "buy",
            "quantity": quantity,
            "price": purchase_price,
            "total_value": quantity * purchase_price,
            "timestamp": datetime.now(),
            "notes": notes
        })
        
        return {"message": f"Added {quantity} {symbol} at ${purchase_price}"}
    
    async def remove_holding(self, user_id: str, symbol: str) -> None:
        """Remove a holding from the portfolio"""
        portfolio = self._get_or_create_portfolio(user_id)
        portfolio["holdings"] = [
            h for h in portfolio["holdings"] if h["symbol"] != symbol
        ]
    
    async def get_transactions(
        self, 
        user_id: str,
        symbol: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get transaction history"""
        portfolio = self._get_or_create_portfolio(user_id)
        transactions = portfolio.get("transactions", [])
        
        if symbol:
            transactions = [t for t in transactions if t["symbol"] == symbol]
        
        return transactions[:limit]
    
    async def get_performance(self, user_id: str, period: str = "1m") -> Dict:
        """Get portfolio performance over time"""
        # In production, this would calculate actual historical performance
        return {
            "period": period,
            "total_return": 0.085,
            "total_return_percent": 8.5,
            "benchmark_return": 0.065,
            "alpha": 0.02,
            "beta": 1.1,
            "sharpe_ratio": 1.45,
            "max_drawdown": -0.08,
            "volatility": 0.15,
            "performance_data": []  # Would be time series
        }
    
    async def get_analytics(self, user_id: str) -> Dict:
        """Get advanced portfolio analytics"""
        holdings = await self.get_holdings(user_id)
        
        return {
            "risk_metrics": {
                "portfolio_beta": 1.1,
                "portfolio_volatility": 0.18,
                "sharpe_ratio": 1.45,
                "var_95": -0.032,
                "cvar_95": -0.045
            },
            "diversification": {
                "score": self._calculate_diversification_score(holdings),
                "effective_holdings": len(holdings),
                "concentration_index": 0.15
            },
            "sector_exposure": {
                "Technology": 0.35,
                "Healthcare": 0.20,
                "Finance": 0.15,
                "Consumer": 0.15,
                "Other": 0.15
            },
            "correlation_matrix": {},  # Would calculate actual correlations
            "recommendations": [
                "Consider reducing tech exposure",
                "Add defensive positions for balance"
            ]
        }
    
    async def get_rebalance_suggestions(
        self, 
        user_id: str,
        target_strategy: str = "balanced"
    ) -> Dict:
        """Get AI-powered rebalancing suggestions"""
        holdings = await self.get_holdings(user_id)
        
        # Target allocations by strategy
        targets = {
            "conservative": {"stocks": 0.30, "bonds": 0.50, "crypto": 0.05, "cash": 0.15},
            "balanced": {"stocks": 0.50, "bonds": 0.25, "crypto": 0.10, "cash": 0.15},
            "aggressive": {"stocks": 0.60, "bonds": 0.10, "crypto": 0.25, "cash": 0.05}
        }
        
        target = targets.get(target_strategy, targets["balanced"])
        
        return {
            "target_strategy": target_strategy,
            "target_allocation": target,
            "current_allocation": {},  # Would calculate current
            "rebalancing_needed": True,
            "suggested_actions": [
                {
                    "action": "sell",
                    "symbol": "AAPL",
                    "percentage": 5,
                    "reason": "Over-allocated to tech"
                },
                {
                    "action": "buy",
                    "symbol": "BND",
                    "percentage": 5,
                    "reason": "Under-allocated to bonds"
                }
            ],
            "estimated_trades": 3,
            "estimated_tax_impact": 0
        }
    
    async def get_watchlist(self, user_id: str) -> List[Dict]:
        """Get user's watchlist with current prices"""
        symbols = self._watchlists.get(user_id, [])
        
        watchlist = []
        for symbol in symbols:
            try:
                if self._get_asset_type(symbol) == "crypto":
                    quote = await self.market_service.get_crypto_quote(symbol)
                else:
                    quote = await self.market_service.get_stock_quote(symbol)
                
                if quote:
                    watchlist.append(quote)
            except:
                pass
        
        return watchlist
    
    async def add_to_watchlist(self, user_id: str, symbol: str) -> None:
        """Add symbol to watchlist"""
        if user_id not in self._watchlists:
            self._watchlists[user_id] = []
        
        if symbol not in self._watchlists[user_id]:
            self._watchlists[user_id].append(symbol)
    
    async def remove_from_watchlist(self, user_id: str, symbol: str) -> None:
        """Remove symbol from watchlist"""
        if user_id in self._watchlists:
            self._watchlists[user_id] = [
                s for s in self._watchlists[user_id] if s != symbol
            ]
    
    # ============ Helper Methods ============
    
    def _get_or_create_portfolio(self, user_id: str) -> Dict:
        """Get or create a portfolio for a user"""
        if user_id not in self._portfolios:
            self._portfolios[user_id] = {
                "user_id": user_id,
                "holdings": [],
                "transactions": [],
                "created_at": datetime.now()
            }
        return self._portfolios[user_id]
    
    async def _update_holding_prices(self, holdings: List[Dict]) -> List[Dict]:
        """Update current prices for all holdings"""
        for holding in holdings:
            try:
                symbol = holding["symbol"]
                
                if self._get_asset_type(symbol) == "crypto":
                    quote = await self.market_service.get_crypto_quote(symbol)
                else:
                    quote = await self.market_service.get_stock_quote(symbol)
                
                if quote:
                    holding["current_price"] = quote["price"]
                    holding["current_value"] = holding["quantity"] * quote["price"]
                    cost_basis = holding["quantity"] * holding["average_cost"]
                    holding["profit_loss"] = holding["current_value"] - cost_basis
                    holding["profit_loss_percent"] = (
                        (holding["profit_loss"] / cost_basis * 100) 
                        if cost_basis > 0 else 0
                    )
            except:
                pass
        
        # Calculate allocation percentages
        total_value = sum(h.get("current_value", 0) for h in holdings)
        for holding in holdings:
            holding["allocation_percent"] = (
                holding.get("current_value", 0) / total_value * 100
                if total_value > 0 else 0
            )
        
        return holdings
    
    def _get_asset_type(self, symbol: str) -> str:
        """Determine if symbol is stock or crypto"""
        crypto_symbols = [
            "BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", 
            "DOT", "MATIC", "LINK", "AVAX", "ATOM", "UNI"
        ]
        return "crypto" if symbol.upper() in crypto_symbols else "stock"
    
    def _calculate_diversification_score(self, holdings: List[Dict]) -> float:
        """Calculate portfolio diversification score (0-10)"""
        if not holdings:
            return 0
        
        num_holdings = len(holdings)
        
        # More holdings = better diversification (up to a point)
        holding_score = min(num_holdings / 10 * 5, 5)
        
        # Check concentration (top holding shouldn't be >25%)
        if holdings:
            allocations = [h.get("allocation_percent", 0) for h in holdings]
            max_allocation = max(allocations) if allocations else 0
            concentration_score = 5 if max_allocation < 25 else 5 * (1 - (max_allocation - 25) / 75)
        else:
            concentration_score = 0
        
        return round(holding_score + max(concentration_score, 0), 1)
    
    def _calculate_risk_score(self, holdings: List[Dict]) -> float:
        """Calculate portfolio risk score (0-10, higher = riskier)"""
        if not holdings:
            return 0
        
        # Higher crypto allocation = higher risk
        crypto_allocation = sum(
            h.get("allocation_percent", 0) 
            for h in holdings 
            if h.get("asset_type") == "crypto"
        ) / 100
        
        crypto_risk = crypto_allocation * 5
        
        # Less diversification = higher risk
        div_score = self._calculate_diversification_score(holdings)
        diversification_risk = (10 - div_score) / 2
        
        return round(crypto_risk + diversification_risk, 1)
