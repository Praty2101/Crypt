'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Send,
    Sparkles,
    Bot,
    User,
    TrendingUp,
    Newspaper,
    AlertTriangle,
    Target,
    Briefcase,
    Loader2
} from 'lucide-react';
import styles from './AgentChat.module.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    agents?: string[];
}

const agentInfo = [
    { id: 'market_analyst', name: 'Market Analyst', icon: TrendingUp, color: '#8b5cf6' },
    { id: 'news_scout', name: 'News Scout', icon: Newspaper, color: '#06b6d4' },
    { id: 'risk_manager', name: 'Risk Manager', icon: AlertTriangle, color: '#f59e0b' },
    { id: 'strategy_coach', name: 'Strategy Coach', icon: Target, color: '#10b981' },
    { id: 'portfolio_bot', name: 'Portfolio Bot', icon: Briefcase, color: '#6366f1' },
];

const sampleQuestions = [
    "Is Tesla a good entry point right now?",
    "What's the risk level of Bitcoin today?",
    "Should I rebalance my portfolio?",
    "What's the market sentiment on NVIDIA?",
    "Analyze ETH for a swing trade",
];

const mockResponses: Record<string, { content: string; agents: string[] }> = {
    "Is Tesla a good entry point right now?": {
        content: `**Tesla (TSLA) Analysis**

Based on my analysis across multiple factors:

📈 **Technical View:**
- Currently trading at $245.50, testing the 50-day moving average
- RSI at 42, coming out of oversold territory
- MACD showing early signs of bullish crossover

📰 **News & Sentiment:**
- Mixed sentiment due to margin pressures
- Positive buzz around Cybertruck deliveries
- Reddit/Twitter sentiment: Slightly bullish (0.58)

⚠️ **Risk Assessment:**
- Volatility: HIGH (3.2% daily average)
- Earnings in 2 weeks - expect increased volatility
- China sales uncertainty remains

🎯 **Strategy Recommendation:**
For a balanced portfolio, consider a **partial position** (50% of intended size) now with stop-loss at $225. Add remaining on confirmed breakout above $260 or on pullback to $230 support.

**Confidence: 68%** | Risk Level: Medium-High

*This is analysis, not financial advice. Always do your own research.*`,
        agents: ['market_analyst', 'news_scout', 'risk_manager', 'strategy_coach']
    },
    "What's the risk level of Bitcoin today?": {
        content: `**Bitcoin Risk Assessment**

Current Price: $43,521 | 24h Change: +2.34%

⚠️ **Risk Level: MEDIUM-HIGH**

**Key Risk Factors:**

1. **Volatility** - 30-day volatility at 4.2% (elevated)
2. **Correlation** - High correlation with NASDAQ (0.72)
3. **Leverage** - Open interest at elevated levels
4. **Macro** - Fed decision next week could impact

**On-Chain Metrics:**
- Exchange inflows: Normal ✅
- Whale activity: Accumulating 🟢
- Funding rates: Slightly positive

**Danger Signals:**
- None critical at this time
- Watch $41,000 support level

**Recommendation:**
If holding BTC, maintain position with stop below $40,500.
If looking to enter, size position at 50% max and scale in on pullbacks.

**Risk Score: 6.5/10**`,
        agents: ['risk_manager', 'market_analyst']
    },
};

export default function AgentChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Get mock response or generate generic one
        const mockResponse = mockResponses[input] || {
            content: `I've analyzed your query about "${input}".

Based on my assessment across multiple models and agents:

📈 **Market Analysis:**
The current market conditions suggest moderate caution. Key technical indicators are showing mixed signals.

📰 **Sentiment:**
Overall sentiment is neutral to slightly positive. No major catalysts detected in the near term.

⚠️ **Risk Assessment:**
Risk level appears moderate. Always size positions according to your risk tolerance.

🎯 **Recommendation:**
Consider your investment horizon and risk profile before making decisions. I recommend conducting additional research on specific aspects you're most interested in.

*Ask me follow-up questions for more detailed analysis on specific aspects!*`,
            agents: ['market_analyst', 'risk_manager', 'strategy_coach']
        };

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: mockResponse.content,
            timestamp: new Date(),
            agents: mockResponse.agents,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
    };

    const handleQuickQuestion = (question: string) => {
        setInput(question);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Sparkles size={20} />
                    <h3>AI Agents</h3>
                </div>
                <div className={styles.agentsList}>
                    {agentInfo.map((agent) => (
                        <div key={agent.id} className={styles.agentItem}>
                            <div className={styles.agentIcon} style={{ background: agent.color }}>
                                <agent.icon size={16} />
                            </div>
                            <div className={styles.agentInfo}>
                                <span className={styles.agentName}>{agent.name}</span>
                                <span className={styles.agentStatus}>Online</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.sidebarFooter}>
                    <p>All 5 agents collaborate to provide comprehensive analysis</p>
                </div>
            </div>

            <div className={styles.chatArea}>
                <div className={styles.chatHeader}>
                    <div className={styles.chatTitle}>
                        <Bot size={24} />
                        <div>
                            <h2>AI Trading Assistant</h2>
                            <p>Ask anything about markets, crypto, or your portfolio</p>
                        </div>
                    </div>
                </div>

                <div className={styles.messagesContainer}>
                    {messages.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <Sparkles size={48} />
                            </div>
                            <h3>Start a Conversation</h3>
                            <p>Ask me about stocks, crypto, market trends, or get personalized trading suggestions.</p>

                            <div className={styles.quickQuestions}>
                                <span>Try asking:</span>
                                <div className={styles.questionsList}>
                                    {sampleQuestions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            className={styles.questionBtn}
                                            onClick={() => handleQuickQuestion(q)}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.messages}>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                                >
                                    <div className={styles.messageAvatar}>
                                        {message.role === 'user' ? (
                                            <User size={20} />
                                        ) : (
                                            <Bot size={20} />
                                        )}
                                    </div>
                                    <div className={styles.messageContent}>
                                        {message.agents && (
                                            <div className={styles.agentsBadges}>
                                                {message.agents.map((agentId) => {
                                                    const agent = agentInfo.find((a) => a.id === agentId);
                                                    return agent ? (
                                                        <span
                                                            key={agentId}
                                                            className={styles.agentBadge}
                                                            style={{ background: agent.color }}
                                                        >
                                                            {agent.name}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                        <div className={styles.messageText}>
                                            {message.content.split('\n').map((line, idx) => {
                                                if (line.startsWith('**') && line.endsWith('**')) {
                                                    return <h4 key={idx}>{line.replace(/\*\*/g, '')}</h4>;
                                                }
                                                if (line.startsWith('- ')) {
                                                    return <li key={idx}>{line.substring(2)}</li>;
                                                }
                                                if (line.startsWith('📈') || line.startsWith('📰') || line.startsWith('⚠️') || line.startsWith('🎯')) {
                                                    return <p key={idx} className={styles.sectionHeader}>{line}</p>;
                                                }
                                                return line ? <p key={idx}>{line}</p> : <br key={idx} />;
                                            })}
                                        </div>
                                        <span className={styles.messageTime}>
                                            {message.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className={`${styles.message} ${styles.assistantMessage}`}>
                                    <div className={styles.messageAvatar}>
                                        <Bot size={20} />
                                    </div>
                                    <div className={styles.messageContent}>
                                        <div className={styles.typingIndicator}>
                                            <Loader2 size={16} className={styles.spinner} />
                                            <span>Consulting agents...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className={styles.inputArea}>
                    <div className={styles.inputWrapper}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about any asset, market trend, or trading strategy..."
                            className={styles.input}
                            rows={1}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                        >
                            {isLoading ? <Loader2 size={20} className={styles.spinner} /> : <Send size={20} />}
                        </button>
                    </div>
                    <p className={styles.disclaimer}>
                        AI responses are for educational purposes only. Not financial advice.
                    </p>
                </div>
            </div>
        </div>
    );
}
