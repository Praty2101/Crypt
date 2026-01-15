'use client';

import { useState } from 'react';
import {
    Shield,
    TrendingUp,
    Zap,
    AlertTriangle,
    CheckCircle,
    Info,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import styles from './SuggestedActions.module.css';

type RiskProfile = 'conservative' | 'balanced' | 'aggressive';

interface Action {
    id: string;
    asset: string;
    assetName: string;
    action: string;
    confidence: number;
    reasoning: string;
    riskFactors: string[];
    agentOpinions: {
        agent: string;
        opinion: string;
    }[];
    modelAgreement: number;
}

const mockActions: Record<RiskProfile, Action[]> = {
    conservative: [
        {
            id: '1',
            asset: 'VOO',
            assetName: 'Vanguard S&P 500 ETF',
            action: 'Hold / DCA',
            confidence: 0.85,
            reasoning: 'Broad market exposure with low volatility. Perfect for conservative portfolios.',
            riskFactors: ['Market-wide pullback possible', 'Interest rate sensitivity'],
            agentOpinions: [
                { agent: '📈 Market Analyst', opinion: 'Stable uptrend, ideal for accumulation' },
                { agent: '⚠️ Risk Manager', opinion: 'Low risk, well-diversified' },
            ],
            modelAgreement: 0.92
        },
        {
            id: '2',
            asset: 'BND',
            assetName: 'Vanguard Total Bond ETF',
            action: 'Accumulate',
            confidence: 0.78,
            reasoning: 'Bonds provide stability as Fed approaches rate cuts.',
            riskFactors: ['Duration risk if rates rise unexpectedly'],
            agentOpinions: [
                { agent: '🎯 Strategy Coach', opinion: 'Good time to add fixed income' },
                { agent: '⚠️ Risk Manager', opinion: 'Hedges equity risk effectively' },
            ],
            modelAgreement: 0.85
        },
    ],
    balanced: [
        {
            id: '3',
            asset: 'AAPL',
            assetName: 'Apple Inc.',
            action: 'Partial Buy',
            confidence: 0.78,
            reasoning: 'Strong fundamentals with recent pullback creating entry opportunity.',
            riskFactors: ['China exposure', 'iPhone sales uncertainty', 'High valuation'],
            agentOpinions: [
                { agent: '📈 Market Analyst', opinion: 'Testing support, RSI neutral' },
                { agent: '📰 News Scout', opinion: 'Positive sentiment on AI features' },
                { agent: '⚠️ Risk Manager', opinion: 'Medium risk, earnings coming up' },
            ],
            modelAgreement: 0.82
        },
        {
            id: '4',
            asset: 'ETH',
            assetName: 'Ethereum',
            action: 'Accumulate',
            confidence: 0.75,
            reasoning: 'ETH showing strength with ETF approval momentum.',
            riskFactors: ['Crypto volatility', 'Regulatory uncertainty'],
            agentOpinions: [
                { agent: '📈 Market Analyst', opinion: 'Breaking resistance levels' },
                { agent: '📰 News Scout', opinion: 'High social buzz, ETF catalyst' },
                { agent: '⚠️ Risk Manager', opinion: 'Higher volatility, size position accordingly' },
            ],
            modelAgreement: 0.75
        },
    ],
    aggressive: [
        {
            id: '5',
            asset: 'NVDA',
            assetName: 'NVIDIA Corp.',
            action: 'Buy on Breakout',
            confidence: 0.82,
            reasoning: 'AI momentum leader, strong earnings trajectory.',
            riskFactors: ['Extended valuation', 'Concentration in AI narrative', 'High volatility'],
            agentOpinions: [
                { agent: '📈 Market Analyst', opinion: 'Approaching ATH, momentum strong' },
                { agent: '📰 News Scout', opinion: 'AI demand narrative intensifying' },
                { agent: '🎯 Strategy Coach', opinion: 'Consider breakout entry with tight stop' },
            ],
            modelAgreement: 0.88
        },
        {
            id: '6',
            asset: 'SOL',
            assetName: 'Solana',
            action: 'Swing Trade',
            confidence: 0.72,
            reasoning: 'High beta play on crypto rally, strong technicals.',
            riskFactors: ['Extreme volatility', 'Network concerns', 'Correlation to BTC'],
            agentOpinions: [
                { agent: '📈 Market Analyst', opinion: 'Strong momentum, outperforming ETH' },
                { agent: '⚠️ Risk Manager', opinion: 'Maximum 5% position size recommended' },
            ],
            modelAgreement: 0.70
        },
    ],
};

const profileDescriptions = {
    conservative: 'Lower risk, focus on capital preservation and steady returns',
    balanced: 'Moderate risk-reward with diversified growth opportunities',
    aggressive: 'Higher risk tolerance, seeking alpha through momentum plays',
};

export default function SuggestedActions() {
    const [selectedProfile, setSelectedProfile] = useState<RiskProfile>('balanced');
    const [expandedAction, setExpandedAction] = useState<string | null>(null);

    const actions = mockActions[selectedProfile];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>Suggested Actions</h2>
                    <p>AI-powered recommendations based on your risk profile</p>
                </div>
                <div className={styles.aiTag}>
                    <Sparkles size={14} />
                    <span>Powered by 5 AI Agents</span>
                </div>
            </div>

            {/* Risk Profile Selector */}
            <div className={styles.profileSelector}>
                <button
                    className={`${styles.profileBtn} ${selectedProfile === 'conservative' ? styles.active : ''}`}
                    onClick={() => setSelectedProfile('conservative')}
                >
                    <Shield size={20} />
                    <div className={styles.profileInfo}>
                        <span className={styles.profileLabel}>Conservative</span>
                        <span className={styles.profileDesc}>Lower risk</span>
                    </div>
                </button>
                <button
                    className={`${styles.profileBtn} ${selectedProfile === 'balanced' ? styles.active : ''}`}
                    onClick={() => setSelectedProfile('balanced')}
                >
                    <TrendingUp size={20} />
                    <div className={styles.profileInfo}>
                        <span className={styles.profileLabel}>Balanced</span>
                        <span className={styles.profileDesc}>Moderate risk</span>
                    </div>
                </button>
                <button
                    className={`${styles.profileBtn} ${selectedProfile === 'aggressive' ? styles.active : ''}`}
                    onClick={() => setSelectedProfile('aggressive')}
                >
                    <Zap size={20} />
                    <div className={styles.profileInfo}>
                        <span className={styles.profileLabel}>Aggressive</span>
                        <span className={styles.profileDesc}>Higher risk</span>
                    </div>
                </button>
            </div>

            <p className={styles.profileDescription}>{profileDescriptions[selectedProfile]}</p>

            {/* Action Cards */}
            <div className={styles.actionsList}>
                {actions.map((action) => (
                    <div
                        key={action.id}
                        className={`${styles.actionCard} ${expandedAction === action.id ? styles.expanded : ''}`}
                    >
                        <div
                            className={styles.actionHeader}
                            onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                        >
                            <div className={styles.actionMain}>
                                <div className={styles.actionIcon}>
                                    {action.asset.charAt(0)}
                                </div>
                                <div className={styles.actionInfo}>
                                    <span className={styles.actionAsset}>{action.asset}</span>
                                    <span className={styles.actionName}>{action.assetName}</span>
                                </div>
                            </div>

                            <div className={styles.actionMeta}>
                                <span className={styles.actionType}>{action.action}</span>
                                <div className={styles.confidence}>
                                    <div className={styles.confidenceBar}>
                                        <div
                                            className={styles.confidenceFill}
                                            style={{ width: `${action.confidence * 100}%` }}
                                        ></div>
                                    </div>
                                    <span>{(action.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <ChevronRight
                                    size={20}
                                    className={`${styles.chevron} ${expandedAction === action.id ? styles.rotated : ''}`}
                                />
                            </div>
                        </div>

                        {expandedAction === action.id && (
                            <div className={styles.actionDetails}>
                                <div className={styles.reasoning}>
                                    <Info size={16} />
                                    <p>{action.reasoning}</p>
                                </div>

                                <div className={styles.section}>
                                    <h4>
                                        <AlertTriangle size={14} />
                                        Risk Factors
                                    </h4>
                                    <ul>
                                        {action.riskFactors.map((risk, idx) => (
                                            <li key={idx}>{risk}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={styles.section}>
                                    <h4>
                                        <CheckCircle size={14} />
                                        Agent Opinions
                                    </h4>
                                    <div className={styles.opinions}>
                                        {action.agentOpinions.map((opinion, idx) => (
                                            <div key={idx} className={styles.opinion}>
                                                <span className={styles.agentName}>{opinion.agent}</span>
                                                <span className={styles.opinionText}>{opinion.opinion}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.modelAgreement}>
                                    <span>Model Agreement: </span>
                                    <strong>{(action.modelAgreement * 100).toFixed(0)}%</strong>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.disclaimer}>
                <Info size={14} />
                <p>
                    These suggestions are for educational purposes only and do not constitute financial advice.
                    Always conduct your own research before making investment decisions.
                </p>
            </div>
        </div>
    );
}
