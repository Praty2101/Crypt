"""
Strategy Coach Agent
Suggests trading strategies and tactics
"""

from typing import Any, Dict, List, Optional
from datetime import datetime

from agents.base_agent import BaseAgent, AgentResponse


class StrategyCoachAgent(BaseAgent):
    """
    🎯 Strategy Coach Agent
    
    Specializes in:
    - Strategy recommendations
    - Entry/exit timing
    - Position sizing
    - Portfolio allocation
    - Trade management
    - Risk-adjusted returns
    """
    
    def __init__(self):
        super().__init__(
            agent_id="strategy_coach",
            agent_name="🎯 Strategy Coach",
            role_description="""You are an expert trading strategist who helps users 
            develop and execute trading strategies. You specialize in entry/exit timing, 
            position management, and portfolio allocation. You consider risk-reward ratios, 
            market conditions, and individual risk tolerance to provide actionable strategies. 
            You never give direct financial advice but educate on strategic approaches.""",
            temperature=0.6
        )
    
    def _initialize_tools(self) -> List[Any]:
        """Initialize strategy tools"""
        return [
            "analyze_risk_reward",
            "calculate_entry_exit",
            "optimize_allocation",
            "backtest_strategy"
        ]
    
    async def analyze(self, query: str, context: Optional[Dict] = None) -> AgentResponse:
        """Perform strategy analysis"""
        analysis_prompt = f"""
        Analyze the following from a strategic perspective:
        
        Query: {query}
        
        Provide:
        1. Strategic assessment
        2. Recommended approach (with alternatives)
        3. Entry considerations
        4. Exit strategy (both profit-taking and stop-loss)
        5. Position sizing guidance
        6. Key levels to monitor
        
        Frame everything as educational strategy discussion, not advice.
        """
        
        return await self.ask(analysis_prompt, context)
    
    async def get_strategy_recommendation(
        self, 
        symbol: str, 
        risk_profile: str = "balanced",
        time_horizon: str = "medium"
    ) -> Dict:
        """Get strategy recommendation for a symbol"""
        prompt = f"""
        Develop a strategy recommendation for {symbol}.
        
        Parameters:
        - Risk Profile: {risk_profile}
        - Time Horizon: {time_horizon}
        
        Provide:
        - Recommended strategy type (swing, momentum, value, etc.)
        - Entry zone with specific levels
        - Take-profit targets (multiple levels)
        - Stop-loss placement
        - Position sizing as % of portfolio
        - Key conditions to monitor
        """
        
        response = await self.ask(prompt)
        
        # Strategy parameters based on risk profile
        strategy_params = {
            "conservative": {
                "strategy_type": "DCA (Dollar Cost Average)",
                "entry_approach": "scale_in",
                "stop_loss_pct": 0.05,
                "take_profit_targets": [0.10, 0.15, 0.20],
                "position_size_pct": 0.03
            },
            "balanced": {
                "strategy_type": "Swing Trade",
                "entry_approach": "pullback",
                "stop_loss_pct": 0.08,
                "take_profit_targets": [0.15, 0.25, 0.35],
                "position_size_pct": 0.05
            },
            "aggressive": {
                "strategy_type": "Momentum Trade",
                "entry_approach": "breakout",
                "stop_loss_pct": 0.12,
                "take_profit_targets": [0.25, 0.40, 0.60],
                "position_size_pct": 0.08
            }
        }
        
        params = strategy_params.get(risk_profile, strategy_params["balanced"])
        
        return {
            "symbol": symbol,
            "risk_profile": risk_profile,
            "time_horizon": time_horizon,
            "strategy": params,
            "analysis": response.response,
            "confidence": response.confidence,
            "key_levels": {
                "entry_zone": "Current price ± 2%",
                "stop_loss": f"-{params['stop_loss_pct']*100}% from entry",
                "targets": [f"+{t*100}%" for t in params['take_profit_targets']]
            }
        }
    
    async def suggest_actions(self, portfolio_context: Dict, market_context: Dict) -> Dict:
        """Suggest actions based on portfolio and market context"""
        prompt = f"""
        Based on the current context, suggest strategic actions.
        
        Portfolio Context: {portfolio_context}
        Market Context: {market_context}
        
        Consider:
        - Current market conditions
        - Portfolio composition
        - Recent performance
        - Risk levels
        - Upcoming catalysts
        
        Provide 3-5 actionable suggestions with reasoning.
        """
        
        response = await self.ask(prompt)
        
        return {
            "suggested_actions": [
                {
                    "action": "Reduce Tech Exposure",
                    "reason": "Sector overweight and rising rates",
                    "priority": "medium",
                    "urgency": "this_week"
                },
                {
                    "action": "Add Defensive Positions",
                    "reason": "Portfolio lacks defensive allocation",
                    "priority": "high",
                    "urgency": "soon"
                },
                {
                    "action": "Set Trailing Stops on Winners",
                    "reason": "Lock in gains on positions up >30%",
                    "priority": "medium",
                    "urgency": "when_convenient"
                }
            ],
            "analysis": response.response,
            "confidence": response.confidence,
            "timestamp": datetime.now().isoformat()
        }
    
    async def evaluate_trade_idea(
        self, 
        symbol: str, 
        direction: str,  # long or short
        entry_price: float,
        stop_loss: float,
        take_profit: float
    ) -> Dict:
        """Evaluate a trade idea"""
        risk = abs(entry_price - stop_loss)
        reward = abs(take_profit - entry_price)
        risk_reward_ratio = reward / risk if risk > 0 else 0
        
        prompt = f"""
        Evaluate this trade idea:
        
        - Symbol: {symbol}
        - Direction: {direction}
        - Entry: ${entry_price}
        - Stop Loss: ${stop_loss}
        - Take Profit: ${take_profit}
        - Risk/Reward: {risk_reward_ratio:.2f}
        
        Assess:
        - Is the R:R adequate?
        - Is the stop placement logical?
        - Are targets realistic?
        - Current market alignment
        - Suggested adjustments
        """
        
        response = await self.ask(prompt)
        
        # Evaluate the trade
        rating = "good" if risk_reward_ratio >= 2 else "fair" if risk_reward_ratio >= 1.5 else "poor"
        
        return {
            "symbol": symbol,
            "direction": direction,
            "entry": entry_price,
            "stop_loss": stop_loss,
            "take_profit": take_profit,
            "risk_reward_ratio": risk_reward_ratio,
            "trade_rating": rating,
            "analysis": response.response,
            "suggestions": [],
            "confidence": response.confidence
        }
    
    async def get_allocation_strategy(self, risk_profile: str, investment_amount: float) -> Dict:
        """Get portfolio allocation strategy"""
        allocations = {
            "conservative": {
                "stocks": 0.30,
                "bonds": 0.40,
                "crypto": 0.05,
                "commodities": 0.10,
                "cash": 0.15
            },
            "balanced": {
                "stocks": 0.50,
                "bonds": 0.20,
                "crypto": 0.10,
                "commodities": 0.10,
                "cash": 0.10
            },
            "aggressive": {
                "stocks": 0.60,
                "bonds": 0.05,
                "crypto": 0.25,
                "commodities": 0.05,
                "cash": 0.05
            }
        }
        
        allocation = allocations.get(risk_profile, allocations["balanced"])
        
        return {
            "risk_profile": risk_profile,
            "total_investment": investment_amount,
            "allocation": allocation,
            "amounts": {k: v * investment_amount for k, v in allocation.items()},
            "reasoning": f"This {risk_profile} allocation balances growth and risk based on your profile.",
            "rebalance_frequency": "quarterly"
        }
