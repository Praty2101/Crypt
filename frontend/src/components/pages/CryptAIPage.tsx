'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, User, Bot, Loader2, TrendingUp, BarChart2, Shield, Wallet, Newspaper } from 'lucide-react';
import styles from './CryptAIPage.module.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    agent?: string;
    timestamp: Date;
}

interface Agent {
    id: string;
    name: string;
    icon: any;
    description: string;
    color: string;
}

const agents: Agent[] = [
    { id: 'analyst', name: 'Market Analyst', icon: TrendingUp, description: 'Technical analysis & trends', color: '#58a6ff' },
    { id: 'news', name: 'News Scout', icon: Newspaper, description: 'News & sentiment analysis', color: '#3fb950' },
    { id: 'risk', name: 'Risk Manager', icon: Shield, description: 'Risk assessment & alerts', color: '#f85149' },
    { id: 'strategy', name: 'Strategy Coach', icon: BarChart2, description: 'Trading strategies', color: '#a371f7' },
    { id: 'portfolio', name: 'Portfolio Bot', icon: Wallet, description: 'Portfolio optimization', color: '#f0883e' },
];

const quickPrompts = [
    "What's the current market sentiment?",
    "Analyze BTC price action",
    "Top 3 tokens to watch this week",
    "Should I rebalance my portfolio?",
    "Explain the recent ETH rally",
];

interface CryptAIPageProps {
    isModal?: boolean;
    onClose?: () => void;
}

export default function CryptAIPage({ isModal, onClose }: CryptAIPageProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
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

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const agent = selectedAgent
                ? agents.find(a => a.id === selectedAgent)
                : agents[Math.floor(Math.random() * agents.length)];

            const responses: Record<string, string> = {
                analyst: `📊 **Market Analysis:**\n\nBased on current technical indicators, ${input.includes('BTC') ? 'Bitcoin' : 'the market'} is showing ${Math.random() > 0.5 ? 'bullish' : 'consolidating'} signals.\n\n• RSI: 62 (neutral-bullish)\n• MACD: Positive crossover\n• Volume: Above 20-day average\n\nKey levels to watch: Support at $92,500, resistance at $98,000.`,
                news: `📰 **News Summary:**\n\nRecent developments:\n\n1. Bitcoin ETF inflows reached $750M today\n2. Ethereum's Dencun upgrade shows positive network effects\n3. SEC regulatory clarity improving for crypto markets\n\nOverall sentiment: **Bullish** (72/100)`,
                risk: `⚠️ **Risk Assessment:**\n\nCurrent market risk level: **Moderate**\n\n• VIX equivalent: 14.85 (low volatility)\n• Liquidation risk: Low\n• Correlation with equities: 0.45\n\n**Recommendations:**\n- Maintain stop-losses at 5% below entry\n- Consider reducing leverage if using`,
                strategy: `🎯 **Strategy Recommendation:**\n\nBased on your ${input.toLowerCase().includes('portfolio') ? 'portfolio' : 'query'}:\n\n1. **Entry timing:** Current levels offer favorable risk-reward\n2. **Position sizing:** Allocate 5-10% of portfolio\n3. **Take profit:** Set targets at +15%, +25%\n4. **Stop loss:** -8% from entry\n\nRisk profile: Balanced`,
                portfolio: `💼 **Portfolio Analysis:**\n\nYour portfolio health score: **78/100**\n\n• Diversification: Good (7.5/10)\n• Risk exposure: Moderate\n• Suggested rebalancing:\n  - Increase ETH allocation by 5%\n  - Consider adding SOL exposure\n  - Reduce stablecoin allocation\n\nTotal unrealized P/L: +$1,245.80 (+8.3%)`,
            };

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responses[agent?.id || 'analyst'],
                agent: agent?.name,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Sparkles size={20} className={styles.sparkle} />
                    <div>
                        <h2>CryptAI</h2>
                        <p>Your AI-powered trading assistant</p>
                    </div>
                </div>
                {isModal && onClose && (
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className={styles.agents}>
                {agents.map(agent => (
                    <button
                        key={agent.id}
                        className={`${styles.agentBtn} ${selectedAgent === agent.id ? styles.selected : ''}`}
                        style={{ '--agent-color': agent.color } as React.CSSProperties}
                        onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                    >
                        <agent.icon size={14} />
                        <span>{agent.name}</span>
                    </button>
                ))}
            </div>

            <div className={styles.chatArea}>
                {messages.length === 0 ? (
                    <div className={styles.welcome}>
                        <div className={styles.welcomeIcon}>
                            <Sparkles size={40} />
                        </div>
                        <h3>How can I help you today?</h3>
                        <p>Ask me about market trends, price analysis, portfolio optimization, or trading strategies.</p>
                        <div className={styles.quickPrompts}>
                            {quickPrompts.map((prompt, i) => (
                                <button key={i} className={styles.promptBtn} onClick={() => setInput(prompt)}>
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.messages}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
                                <div className={styles.messageAvatar}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={styles.messageContent}>
                                    {msg.agent && <span className={styles.agentTag}>{msg.agent}</span>}
                                    <div className={styles.messageText}>{msg.content}</div>
                                    <span className={styles.messageTime}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.assistant}`}>
                                <div className={styles.messageAvatar}><Bot size={16} /></div>
                                <div className={styles.messageContent}>
                                    <div className={styles.typing}>
                                        <Loader2 size={16} className={styles.spinner} />
                                        CryptAI is thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className={styles.inputArea}>
                <input
                    type="text"
                    placeholder="Ask CryptAI anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}
