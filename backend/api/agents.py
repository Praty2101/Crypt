"""
AI Agents API Router
Endpoints for interacting with the AI agent system
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from agents.orchestrator import AgentOrchestrator
from agents.market_analyst import MarketAnalystAgent
from agents.news_scout import NewsScoutAgent
from agents.risk_manager import RiskManagerAgent
from agents.strategy_coach import StrategyCoachAgent
from agents.portfolio_bot import PortfolioBotAgent


router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message model"""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = None
    agent: Optional[str] = None


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str
    context: Optional[dict] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str
    agents_consulted: List[str]
    confidence: float
    sources: List[dict]
    suggested_actions: Optional[List[dict]] = None
    session_id: str


class AgentAnalysis(BaseModel):
    """Agent analysis result"""
    agent_name: str
    analysis: str
    confidence: float
    key_points: List[str]
    data_sources: List[str]


class AssetAnalysisRequest(BaseModel):
    """Request for analyzing a specific asset"""
    symbol: str
    analysis_type: str = "comprehensive"  # comprehensive, quick, risk, technical
    time_horizon: str = "medium"  # short, medium, long


class AssetAnalysisResponse(BaseModel):
    """Response for asset analysis"""
    symbol: str
    timestamp: datetime
    analyses: List[AgentAnalysis]
    consensus: dict
    suggested_action: dict
    risk_assessment: dict


# Initialize orchestrator
orchestrator = AgentOrchestrator()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agents(request: ChatRequest):
    """
    Chat with the AI agent system.
    The orchestrator will route your query to appropriate agents.
    
    Example queries:
    - "Is Tesla a good entry point right now?"
    - "What's the risk level of Bitcoin today?"
    - "Should I rebalance my portfolio?"
    - "What's the market sentiment on NVIDIA?"
    """
    try:
        response = await orchestrator.process_query(
            query=request.message,
            context=request.context,
            session_id=request.session_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/{symbol}", response_model=AssetAnalysisResponse)
async def analyze_asset(symbol: str, request: AssetAnalysisRequest):
    """
    Get comprehensive analysis of an asset from all agents.
    Each agent provides their specialized perspective.
    """
    try:
        analysis = await orchestrator.analyze_asset(
            symbol=symbol.upper(),
            analysis_type=request.analysis_type,
            time_horizon=request.time_horizon
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agents")
async def list_agents():
    """List all available AI agents and their capabilities"""
    return {
        "agents": [
            {
                "id": "market_analyst",
                "name": "📈 Market Analyst",
                "role": "Analyzes market trends, technical indicators, and price patterns",
                "capabilities": [
                    "Technical analysis",
                    "Trend identification",
                    "Support/resistance levels",
                    "Chart pattern recognition"
                ]
            },
            {
                "id": "news_scout",
                "name": "📰 News Scout",
                "role": "Monitors and summarizes financial news, social media sentiment",
                "capabilities": [
                    "News aggregation",
                    "Sentiment analysis",
                    "Social media monitoring",
                    "Event detection"
                ]
            },
            {
                "id": "risk_manager",
                "name": "⚠️ Risk Manager",
                "role": "Assesses risk levels and warns about potential dangers",
                "capabilities": [
                    "Risk assessment",
                    "Volatility analysis",
                    "Correlation analysis",
                    "Danger alerts"
                ]
            },
            {
                "id": "strategy_coach",
                "name": "🎯 Strategy Coach",
                "role": "Suggests trading strategies and tactics",
                "capabilities": [
                    "Strategy recommendations",
                    "Entry/exit timing",
                    "Position sizing",
                    "Portfolio allocation"
                ]
            },
            {
                "id": "portfolio_bot",
                "name": "💼 Portfolio Bot",
                "role": "Tracks holdings, calculates P/L, monitors diversification",
                "capabilities": [
                    "Portfolio tracking",
                    "P/L calculation",
                    "Diversification scoring",
                    "Rebalancing suggestions"
                ]
            }
        ]
    }


@router.get("/agents/{agent_id}/ask")
async def ask_specific_agent(
    agent_id: str,
    question: str
):
    """Ask a specific agent a question directly"""
    valid_agents = ["market_analyst", "news_scout", "risk_manager", "strategy_coach", "portfolio_bot"]
    
    if agent_id not in valid_agents:
        raise HTTPException(
            status_code=404, 
            detail=f"Agent '{agent_id}' not found. Valid agents: {valid_agents}"
        )
    
    try:
        response = await orchestrator.ask_agent(agent_id, question)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suggestions")
async def get_daily_suggestions(
    risk_profile: str = "balanced"  # conservative, balanced, aggressive
):
    """
    Get AI-generated daily trading suggestions based on risk profile.
    Each suggestion includes reasoning from multiple agents.
    """
    valid_profiles = ["conservative", "balanced", "aggressive"]
    if risk_profile not in valid_profiles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid risk profile. Must be one of: {valid_profiles}"
        )
    
    try:
        suggestions = await orchestrator.generate_suggestions(risk_profile)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market-brief")
async def get_market_brief():
    """
    Get a quick AI-generated market briefing.
    Summarizes current market conditions across all asset classes.
    """
    try:
        brief = await orchestrator.generate_market_brief()
        return brief
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
