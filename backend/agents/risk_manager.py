"""
Risk Manager Agent
Assesses risk levels and warns about potential dangers
"""

from typing import Any, Dict, List, Optional
from datetime import datetime

from agents.base_agent import BaseAgent, AgentResponse


class RiskManagerAgent(BaseAgent):
    """
    ⚠️ Risk Manager Agent
    
    Specializes in:
    - Risk assessment and scoring
    - Volatility analysis
    - Correlation analysis
    - Danger alerts and warnings
    - Position sizing recommendations
    - Portfolio risk metrics
    """
    
    def __init__(self):
        super().__init__(
            agent_id="risk_manager",
            agent_name="⚠️ Risk Manager",
            role_description="""You are an expert risk manager focused on protecting capital 
            and identifying potential dangers. You analyze volatility, correlations, and 
            market conditions to assess risk levels. You provide clear warnings about 
            potential threats and help users understand the risk-reward profile of 
            their decisions. Your primary goal is capital preservation.""",
            temperature=0.4  # More conservative
        )
    
    def _initialize_tools(self) -> List[Any]:
        """Initialize risk analysis tools"""
        return [
            "calculate_volatility",
            "calculate_var",
            "analyze_correlations",
            "calculate_beta",
            "assess_liquidity"
        ]
    
    async def analyze(self, query: str, context: Optional[Dict] = None) -> AgentResponse:
        """Perform risk analysis"""
        analysis_prompt = f"""
        Analyze the risk factors for the following query:
        
        Query: {query}
        
        Provide:
        1. Overall risk rating (1-10, where 10 is highest risk)
        2. Key risk factors identified
        3. Volatility assessment
        4. Correlation risks (if applicable)
        5. Potential downside scenarios
        6. Risk mitigation recommendations
        
        Be direct about dangers and always err on the side of caution.
        """
        
        return await self.ask(analysis_prompt, context)
    
    async def get_risk_assessment(self, symbol: str) -> Dict:
        """Get comprehensive risk assessment for a symbol"""
        prompt = f"""
        Provide a comprehensive risk assessment for {symbol}.
        
        Analyze:
        - Historical volatility
        - Beta relative to market
        - Maximum drawdown history
        - Sector-specific risks
        - Company-specific risks
        - Liquidity risk
        
        Rate overall risk: Low, Medium, High, or Extreme
        """
        
        response = await self.ask(prompt)
        
        # Mock risk metrics
        risk_metrics = {
            "volatility_30d": 0.025,
            "volatility_rating": "medium",
            "beta": 1.15,
            "max_drawdown_1y": -0.18,
            "sharpe_ratio": 1.45,
            "var_95": -0.032,
            "cvar_95": -0.045,
            "liquidity_score": 0.92
        }
        
        return {
            "symbol": symbol,
            "risk_metrics": risk_metrics,
            "overall_risk_rating": "medium",
            "risk_score": 5.5,
            "warnings": [],
            "analysis": response.response,
            "confidence": response.confidence,
            "timestamp": datetime.now().isoformat()
        }
    
    async def analyze_portfolio_risk(self, holdings: List[Dict]) -> Dict:
        """Analyze risk for an entire portfolio"""
        prompt = f"""
        Analyze the risk profile of this portfolio:
        
        Holdings: {holdings}
        
        Assess:
        - Concentration risk
        - Correlation between holdings
        - Overall portfolio volatility
        - Diversification score
        - Sector exposure risks
        - Potential portfolio drawdown
        
        Provide specific recommendations to reduce risk.
        """
        
        response = await self.ask(prompt)
        
        return {
            "portfolio_risk_score": 6.0,
            "diversification_score": 0.72,
            "concentration_risk": "medium",
            "correlation_risk": "low",
            "estimated_volatility": 0.018,
            "max_potential_loss_95": -0.12,
            "analysis": response.response,
            "recommendations": [
                "Consider adding uncorrelated assets",
                "Reduce sector concentration",
                "Add defensive positions"
            ],
            "confidence": response.confidence
        }
    
    async def check_danger_signals(self, symbol: str) -> Dict:
        """Check for danger signals and red flags"""
        prompt = f"""
        Identify any danger signals or red flags for {symbol}.
        
        Check for:
        - Unusual volatility spikes
        - Volume anomalies
        - Negative news catalysts
        - Insider selling
        - Technical breakdown signals
        - Macro risk factors
        
        Be thorough and cautious in your assessment.
        """
        
        response = await self.ask(prompt)
        
        return {
            "symbol": symbol,
            "danger_level": "low",
            "alerts": [],
            "warning_flags": [],
            "analysis": response.response,
            "confidence": response.confidence
        }
    
    async def get_position_size_recommendation(
        self, 
        symbol: str, 
        portfolio_value: float,
        risk_tolerance: str = "balanced"
    ) -> Dict:
        """Recommend position size based on risk"""
        prompt = f"""
        Recommend position size for {symbol}.
        
        Parameters:
        - Portfolio Value: ${portfolio_value:,.2f}
        - Risk Tolerance: {risk_tolerance}
        
        Consider:
        - Asset volatility
        - Portfolio concentration limits
        - Risk per trade (max 1-2% of portfolio)
        - Overall portfolio balance
        
        Provide specific dollar amount and percentage recommendations.
        """
        
        response = await self.ask(prompt)
        
        # Risk-based position sizing
        risk_multipliers = {
            "conservative": 0.02,
            "balanced": 0.04,
            "aggressive": 0.08
        }
        
        multiplier = risk_multipliers.get(risk_tolerance, 0.04)
        recommended_size = portfolio_value * multiplier
        
        return {
            "symbol": symbol,
            "recommended_position": recommended_size,
            "recommended_percentage": multiplier * 100,
            "max_position": portfolio_value * 0.1,  # Hard cap at 10%
            "risk_per_trade": portfolio_value * 0.01,
            "analysis": response.response,
            "confidence": response.confidence
        }
    
    async def volatility_alert(self, symbols: List[str]) -> List[Dict]:
        """Check volatility levels across symbols and alert on anomalies"""
        alerts = []
        
        for symbol in symbols:
            # Mock volatility check
            current_vol = 0.03  # Would be calculated from actual data
            avg_vol = 0.02
            
            if current_vol > avg_vol * 1.5:
                alerts.append({
                    "symbol": symbol,
                    "alert_type": "high_volatility",
                    "current_volatility": current_vol,
                    "average_volatility": avg_vol,
                    "severity": "warning"
                })
        
        return alerts
