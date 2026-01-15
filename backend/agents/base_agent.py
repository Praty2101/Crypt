"""
Base Agent Class
Foundation for all AI agents in the Crypt platform
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel
import logging

from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema import HumanMessage, SystemMessage, AIMessage

from config import settings


logger = logging.getLogger(__name__)


class AgentResponse(BaseModel):
    """Standard agent response model"""
    agent_name: str
    agent_id: str
    response: str
    confidence: float
    key_points: List[str]
    data_sources: List[str]
    timestamp: datetime = None
    
    def __init__(self, **data):
        super().__init__(**data)
        if self.timestamp is None:
            self.timestamp = datetime.now()


class BaseAgent(ABC):
    """
    Abstract base class for all AI agents.
    Each agent has a specific role and uses specialized tools.
    """
    
    def __init__(
        self,
        agent_id: str,
        agent_name: str,
        role_description: str,
        model_name: str = "gpt-4-turbo-preview",
        temperature: float = 0.7
    ):
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.role_description = role_description
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=temperature,
            openai_api_key=settings.openai_api_key
        )
        
        # Agent memory (last 10 interactions)
        self.memory = ConversationBufferWindowMemory(
            k=10,
            return_messages=True
        )
        
        # System prompt
        self.system_prompt = self._build_system_prompt()
        
        # Tools available to this agent
        self.tools = self._initialize_tools()
        
        logger.info(f"Initialized agent: {agent_name} ({agent_id})")
    
    def _build_system_prompt(self) -> str:
        """Build the system prompt for this agent"""
        return f"""You are {self.agent_name}, an AI assistant specializing in financial markets and trading.

Your Role: {self.role_description}

Guidelines:
1. Always provide data-driven, objective analysis
2. Clearly state your confidence level in recommendations
3. Acknowledge uncertainty when it exists
4. Never give financial advice - provide analysis and education only
5. Cite your data sources when making claims
6. Consider multiple perspectives before concluding
7. Use clear, professional language

Risk Disclaimer: All analysis is for educational purposes only. Past performance does not guarantee future results. Users should conduct their own research before making investment decisions.
"""
    
    @abstractmethod
    def _initialize_tools(self) -> List[Any]:
        """Initialize agent-specific tools"""
        pass
    
    @abstractmethod
    async def analyze(self, query: str, context: Optional[Dict] = None) -> AgentResponse:
        """
        Main analysis method for the agent.
        Must be implemented by each specific agent.
        """
        pass
    
    async def ask(self, question: str, context: Optional[Dict] = None) -> AgentResponse:
        """
        Ask the agent a question.
        Uses the agent's specialized knowledge and tools.
        """
        try:
            # Build messages
            messages = [
                SystemMessage(content=self.system_prompt),
            ]
            
            # Add memory context
            memory_messages = self.memory.chat_memory.messages
            messages.extend(memory_messages)
            
            # Add context if provided
            context_str = ""
            if context:
                context_str = f"\n\nCurrent Context:\n{self._format_context(context)}\n\n"
            
            # Add user question
            messages.append(HumanMessage(content=f"{context_str}{question}"))
            
            # Get response
            response = await self.llm.ainvoke(messages)
            
            # Update memory
            self.memory.chat_memory.add_user_message(question)
            self.memory.chat_memory.add_ai_message(response.content)
            
            # Parse and structure response
            return self._structure_response(response.content)
            
        except Exception as e:
            logger.error(f"Agent {self.agent_name} error: {e}")
            return AgentResponse(
                agent_name=self.agent_name,
                agent_id=self.agent_id,
                response=f"I encountered an error processing your request: {str(e)}",
                confidence=0.0,
                key_points=[],
                data_sources=[]
            )
    
    def _format_context(self, context: Dict) -> str:
        """Format context dictionary into readable string"""
        lines = []
        for key, value in context.items():
            if isinstance(value, dict):
                lines.append(f"{key}:")
                for k, v in value.items():
                    lines.append(f"  - {k}: {v}")
            elif isinstance(value, list):
                lines.append(f"{key}: {', '.join(str(v) for v in value)}")
            else:
                lines.append(f"{key}: {value}")
        return "\n".join(lines)
    
    def _structure_response(self, raw_response: str) -> AgentResponse:
        """Structure the raw LLM response into AgentResponse format"""
        # Extract key points (sentences that seem important)
        sentences = raw_response.split(". ")
        key_points = [s.strip() for s in sentences[:3] if len(s) > 20]
        
        # Estimate confidence based on language
        confidence = 0.7  # Default confidence
        if any(word in raw_response.lower() for word in ["strongly suggest", "highly likely", "confident"]):
            confidence = 0.85
        elif any(word in raw_response.lower() for word in ["uncertain", "unclear", "might", "possibly"]):
            confidence = 0.5
        
        return AgentResponse(
            agent_name=self.agent_name,
            agent_id=self.agent_id,
            response=raw_response,
            confidence=confidence,
            key_points=key_points,
            data_sources=["Market Data API", "Historical Analysis"]
        )
    
    async def collaborate(self, other_agent: 'BaseAgent', query: str) -> Dict:
        """
        Collaborate with another agent on a query.
        Returns combined insights from both agents.
        """
        my_response = await self.ask(query)
        other_response = await other_agent.ask(query)
        
        return {
            "query": query,
            "responses": [
                my_response.dict(),
                other_response.dict()
            ],
            "combined_confidence": (my_response.confidence + other_response.confidence) / 2
        }
    
    def clear_memory(self):
        """Clear agent's conversation memory"""
        self.memory.clear()
