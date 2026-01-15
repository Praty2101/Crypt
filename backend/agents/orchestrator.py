"""
Agent Orchestrator
Coordinates all AI agents and routes queries appropriately
"""

from typing import Any, Dict, List, Optional
from datetime import datetime
import asyncio
import uuid
import logging

from agents.base_agent import AgentResponse
from agents.market_analyst import MarketAnalystAgent
from agents.news_scout import NewsScoutAgent
from agents.risk_manager import RiskManagerAgent
from agents.strategy_coach import StrategyCoachAgent
from agents.portfolio_bot import PortfolioBotAgent

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

from config import settings


logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Orchestrates the multi-agent system, routing queries to appropriate agents
    and combining insights for comprehensive responses.
    """
    
    def __init__(self):
        # Initialize all agents
        self.agents = {
            "market_analyst": MarketAnalystAgent(),
            "news_scout": NewsScoutAgent(),
            "risk_manager": RiskManagerAgent(),
            "strategy_coach": StrategyCoachAgent(),
            "portfolio_bot": PortfolioBotAgent()
        }
        
        # Router LLM for query classification
        self.router_llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            openai_api_key=settings.openai_api_key
        )
        
        # Session storage
        self.sessions: Dict[str, Dict] = {}
        
        logger.info("Agent Orchestrator initialized with all agents")
    
    async def process_query(
        self, 
        query: str, 
        context: Optional[Dict] = None,
        session_id: Optional[str] = None
    ) -> Dict:
        """
        Process a user query by routing to appropriate agents.
        """
        # Create or get session
        if not session_id:
            session_id = str(uuid.uuid4())
        
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "messages": [],
                "created_at": datetime.now()
            }
        
        # Store user message
        self.sessions[session_id]["messages"].append({
            "role": "user",
            "content": query,
            "timestamp": datetime.now()
        })
        
        # Route query to determine which agents to involve
        routing = await self._route_query(query)
        
        # Gather responses from selected agents
        agent_responses = await self._gather_agent_responses(
            query, 
            routing["agents"], 
            context
        )
        
        # Synthesize final response
        final_response = await self._synthesize_response(
            query, 
            agent_responses,
            routing
        )
        
        # Store assistant response
        self.sessions[session_id]["messages"].append({
            "role": "assistant",
            "content": final_response["response"],
            "timestamp": datetime.now()
        })
        
        return {
            "response": final_response["response"],
            "agents_consulted": [r["agent"] for r in agent_responses],
            "confidence": final_response["confidence"],
            "sources": final_response.get("sources", []),
            "suggested_actions": final_response.get("suggested_actions"),
            "session_id": session_id
        }
    
    async def _route_query(self, query: str) -> Dict:
        """Route query to determine which agents should respond"""
        routing_prompt = f"""
        Analyze this user query and determine which AI agents should respond.
        
        Query: "{query}"
        
        Available agents:
        - market_analyst: Technical analysis, trends, price patterns, indicators
        - news_scout: News, sentiment, social media, events
        - risk_manager: Risk assessment, volatility, danger signals
        - strategy_coach: Trading strategies, entry/exit, position sizing
        - portfolio_bot: Portfolio tracking, P/L, diversification, rebalancing
        
        Respond in this exact format:
        AGENTS: [comma-separated list of agent IDs]
        PRIMARY: [primary agent ID]
        REASON: [brief reason for selection]
        
        Always include risk_manager if query involves buying, selling, or portfolio changes.
        """
        
        response = await self.router_llm.ainvoke([
            SystemMessage(content="You are a query router for a financial AI system."),
            HumanMessage(content=routing_prompt)
        ])
        
        # Parse response
        content = response.content
        agents = ["market_analyst"]  # Default
        primary = "market_analyst"
        
        if "AGENTS:" in content:
            agents_line = content.split("AGENTS:")[1].split("\n")[0]
            agents = [a.strip() for a in agents_line.split(",")]
        
        if "PRIMARY:" in content:
            primary_line = content.split("PRIMARY:")[1].split("\n")[0]
            primary = primary_line.strip()
        
        # Validate agents
        valid_agents = list(self.agents.keys())
        agents = [a for a in agents if a in valid_agents]
        if not agents:
            agents = ["market_analyst"]
        
        return {
            "agents": agents,
            "primary": primary,
            "raw_response": content
        }
    
    async def _gather_agent_responses(
        self, 
        query: str, 
        agent_ids: List[str],
        context: Optional[Dict] = None
    ) -> List[Dict]:
        """Gather responses from multiple agents in parallel"""
        async def get_response(agent_id: str) -> Dict:
            agent = self.agents.get(agent_id)
            if not agent:
                return None
            
            try:
                response = await agent.analyze(query, context)
                return {
                    "agent": agent_id,
                    "name": agent.agent_name,
                    "response": response.response,
                    "confidence": response.confidence,
                    "key_points": response.key_points
                }
            except Exception as e:
                logger.error(f"Agent {agent_id} error: {e}")
                return None
        
        # Gather all responses in parallel
        tasks = [get_response(agent_id) for agent_id in agent_ids]
        responses = await asyncio.gather(*tasks)
        
        return [r for r in responses if r is not None]
    
    async def _synthesize_response(
        self, 
        original_query: str,
        agent_responses: List[Dict],
        routing: Dict
    ) -> Dict:
        """Synthesize a unified response from multiple agent responses"""
        if not agent_responses:
            return {
                "response": "I apologize, but I couldn't process your query. Please try again.",
                "confidence": 0.0
            }
        
        # If only one agent, return their response directly
        if len(agent_responses) == 1:
            resp = agent_responses[0]
            return {
                "response": resp["response"],
                "confidence": resp["confidence"],
                "sources": [{"agent": resp["agent"], "name": resp["name"]}]
            }
        
        # Synthesize multiple responses
        synthesis_prompt = f"""
        Synthesize these agent responses into a unified, coherent answer.
        
        Original Query: "{original_query}"
        
        Agent Responses:
        {self._format_agent_responses(agent_responses)}
        
        Create a comprehensive response that:
        1. Integrates insights from all agents
        2. Highlights areas of agreement
        3. Notes any conflicting viewpoints
        4. Provides clear, actionable takeaways
        5. Maintains appropriate risk disclaimers
        
        Format the response in a clear, well-structured way.
        """
        
        synthesis = await self.router_llm.ainvoke([
            SystemMessage(content="You are a financial analyst synthesizing multiple expert opinions."),
            HumanMessage(content=synthesis_prompt)
        ])
        
        # Calculate average confidence
        avg_confidence = sum(r["confidence"] for r in agent_responses) / len(agent_responses)
        
        return {
            "response": synthesis.content,
            "confidence": avg_confidence,
            "sources": [{"agent": r["agent"], "name": r["name"]} for r in agent_responses],
            "suggested_actions": self._extract_suggested_actions(agent_responses)
        }
    
    def _format_agent_responses(self, responses: List[Dict]) -> str:
        """Format agent responses for synthesis prompt"""
        formatted = []
        for r in responses:
            formatted.append(f"""
### {r['name']}
{r['response']}
Confidence: {r['confidence']:.0%}
Key Points: {', '.join(r['key_points'][:3])}
""")
        return "\n".join(formatted)
    
    def _extract_suggested_actions(self, responses: List[Dict]) -> List[Dict]:
        """Extract suggested actions from agent responses"""
        # In a real implementation, this would parse the responses more intelligently
        return []
    
    async def analyze_asset(
        self, 
        symbol: str, 
        analysis_type: str = "comprehensive",
        time_horizon: str = "medium"
    ) -> Dict:
        """Get comprehensive analysis of an asset from all agents"""
        context = {
            "symbol": symbol,
            "analysis_type": analysis_type,
            "time_horizon": time_horizon
        }
        
        query = f"Provide a {analysis_type} analysis of {symbol} for a {time_horizon}-term perspective"
        
        # Get all agent responses
        all_agent_ids = list(self.agents.keys())
        responses = await self._gather_agent_responses(query, all_agent_ids, context)
        
        # Build consensus
        consensus = self._build_consensus(responses)
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now(),
            "analyses": [
                {
                    "agent_name": r["name"],
                    "analysis": r["response"],
                    "confidence": r["confidence"],
                    "key_points": r["key_points"],
                    "data_sources": ["Market Data", "Technical Indicators"]
                }
                for r in responses
            ],
            "consensus": consensus,
            "suggested_action": consensus.get("suggested_action", {}),
            "risk_assessment": consensus.get("risk", {})
        }
    
    def _build_consensus(self, responses: List[Dict]) -> Dict:
        """Build consensus from multiple agent responses"""
        if not responses:
            return {}
        
        avg_confidence = sum(r["confidence"] for r in responses) / len(responses)
        
        return {
            "overall_sentiment": "neutral",  # Would be determined by NLP
            "confidence": avg_confidence,
            "agreement_level": "moderate",
            "suggested_action": {
                "action": "hold",
                "reason": "Mixed signals from agents",
                "risk_level": "medium"
            },
            "risk": {
                "level": "medium",
                "score": 5.5
            }
        }
    
    async def ask_agent(self, agent_id: str, question: str) -> Dict:
        """Ask a specific agent a question directly"""
        agent = self.agents.get(agent_id)
        if not agent:
            raise ValueError(f"Agent '{agent_id}' not found")
        
        response = await agent.ask(question)
        
        return {
            "agent": agent_id,
            "name": agent.agent_name,
            "response": response.response,
            "confidence": response.confidence,
            "key_points": response.key_points,
            "timestamp": datetime.now().isoformat()
        }
    
    async def generate_suggestions(self, risk_profile: str) -> Dict:
        """Generate daily trading suggestions based on risk profile"""
        strategy_agent = self.agents["strategy_coach"]
        risk_agent = self.agents["risk_manager"]
        
        # Get strategy suggestions
        strategy_response = await strategy_agent.get_allocation_strategy(
            risk_profile, 
            100000  # Default portfolio size for suggestions
        )
        
        return {
            "risk_profile": risk_profile,
            "suggestions": [
                {
                    "asset": "AAPL",
                    "action": "partial_buy" if risk_profile != "conservative" else "hold",
                    "confidence": 0.75,
                    "reasoning": "Strong fundamentals with recent pullback",
                    "risk_level": "medium"
                },
                {
                    "asset": "BTC",
                    "action": "hold" if risk_profile == "conservative" else "accumulate",
                    "confidence": 0.65,
                    "reasoning": "Positive on-chain metrics, volatility expected",
                    "risk_level": "high"
                }
            ],
            "allocation_strategy": strategy_response,
            "timestamp": datetime.now().isoformat()
        }
    
    async def generate_market_brief(self) -> Dict:
        """Generate a quick market briefing"""
        market_analyst = self.agents["market_analyst"]
        news_scout = self.agents["news_scout"]
        
        # Get market analysis
        market_response = await market_analyst.ask(
            "Provide a brief overview of current market conditions"
        )
        
        return {
            "timestamp": datetime.now().isoformat(),
            "market_status": "open",
            "summary": market_response.response,
            "key_levels": {
                "spy": {"price": 480.50, "change": 0.5},
                "qqq": {"price": 410.25, "change": 0.8},
                "btc": {"price": 42500, "change": 1.2}
            },
            "sentiment": "neutral",
            "volatility": "low",
            "key_events_today": [
                "Fed Minutes Release - 2:00 PM EST",
                "AAPL Earnings After Hours"
            ]
        }
