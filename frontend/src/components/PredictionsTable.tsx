'use client';

import { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download
} from 'lucide-react';
import styles from './PredictionsTable.module.css';

interface Prediction {
    symbol: string;
    name: string;
    assetType: 'stock' | 'crypto';
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    models: {
        name: string;
        direction: string;
        confidence: number;
    }[];
    horizon: string;
    suggestedAction: string;
    riskLevel: 'low' | 'medium' | 'high';
}

const mockPredictions: Prediction[] = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'stock',
        direction: 'bullish',
        confidence: 0.78,
        models: [
            { name: 'LSTM', direction: 'bullish', confidence: 0.82 },
            { name: 'FinBERT', direction: 'bullish', confidence: 0.75 },
            { name: 'Technical', direction: 'neutral', confidence: 0.68 },
        ],
        horizon: '1 Week',
        suggestedAction: 'Partial Buy',
        riskLevel: 'low'
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA Corp.',
        assetType: 'stock',
        direction: 'bullish',
        confidence: 0.85,
        models: [
            { name: 'LSTM', direction: 'bullish', confidence: 0.88 },
            { name: 'FinBERT', direction: 'bullish', confidence: 0.82 },
            { name: 'Technical', direction: 'bullish', confidence: 0.79 },
        ],
        horizon: '1 Week',
        suggestedAction: 'Buy',
        riskLevel: 'medium'
    },
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        assetType: 'crypto',
        direction: 'bullish',
        confidence: 0.72,
        models: [
            { name: 'LSTM', direction: 'bullish', confidence: 0.75 },
            { name: 'Sentiment', direction: 'bullish', confidence: 0.70 },
            { name: 'Technical', direction: 'neutral', confidence: 0.65 },
        ],
        horizon: '1 Day',
        suggestedAction: 'Hold',
        riskLevel: 'high'
    },
    {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        assetType: 'stock',
        direction: 'bearish',
        confidence: 0.68,
        models: [
            { name: 'LSTM', direction: 'bearish', confidence: 0.72 },
            { name: 'FinBERT', direction: 'bearish', confidence: 0.65 },
            { name: 'Technical', direction: 'bearish', confidence: 0.61 },
        ],
        horizon: '1 Week',
        suggestedAction: 'Reduce',
        riskLevel: 'high'
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        assetType: 'crypto',
        direction: 'bullish',
        confidence: 0.75,
        models: [
            { name: 'LSTM', direction: 'bullish', confidence: 0.78 },
            { name: 'Sentiment', direction: 'bullish', confidence: 0.72 },
            { name: 'Technical', direction: 'bullish', confidence: 0.70 },
        ],
        horizon: '1 Day',
        suggestedAction: 'Accumulate',
        riskLevel: 'medium'
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft',
        assetType: 'stock',
        direction: 'neutral',
        confidence: 0.55,
        models: [
            { name: 'LSTM', direction: 'neutral', confidence: 0.58 },
            { name: 'FinBERT', direction: 'bullish', confidence: 0.62 },
            { name: 'Technical', direction: 'neutral', confidence: 0.52 },
        ],
        horizon: '1 Week',
        suggestedAction: 'Hold',
        riskLevel: 'low'
    },
];

export default function PredictionsTable() {
    const [filter, setFilter] = useState<'all' | 'stock' | 'crypto'>('all');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filteredPredictions = mockPredictions.filter(
        p => filter === 'all' || p.assetType === filter
    );

    const getDirectionIcon = (direction: string) => {
        switch (direction) {
            case 'bullish':
                return <TrendingUp size={16} />;
            case 'bearish':
                return <TrendingDown size={16} />;
            default:
                return <Minus size={16} />;
        }
    };

    const getDirectionClass = (direction: string) => {
        switch (direction) {
            case 'bullish':
                return styles.bullish;
            case 'bearish':
                return styles.bearish;
            default:
                return styles.neutral;
        }
    };

    const getRiskClass = (risk: string) => {
        switch (risk) {
            case 'low':
                return styles.riskLow;
            case 'medium':
                return styles.riskMedium;
            case 'high':
                return styles.riskHigh;
            default:
                return '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>Model Predictions</h2>
                    <p>Aggregated predictions from multiple ML models</p>
                </div>
                <div className={styles.actions}>
                    <div className={styles.filterGroup}>
                        <button
                            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'stock' ? styles.active : ''}`}
                            onClick={() => setFilter('stock')}
                        >
                            Stocks
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'crypto' ? styles.active : ''}`}
                            onClick={() => setFilter('crypto')}
                        >
                            Crypto
                        </button>
                    </div>
                    <button className={styles.exportBtn}>
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Direction</th>
                            <th>Confidence</th>
                            <th>Model Agreement</th>
                            <th>Horizon</th>
                            <th>Risk</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPredictions.map((prediction) => (
                            <tr
                                key={prediction.symbol}
                                className={styles.row}
                                onMouseEnter={() => setHoveredRow(prediction.symbol)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <td>
                                    <div className={styles.assetCell}>
                                        <div className={styles.assetIcon}>
                                            {prediction.symbol.charAt(0)}
                                        </div>
                                        <div className={styles.assetInfo}>
                                            <span className={styles.assetSymbol}>{prediction.symbol}</span>
                                            <span className={styles.assetName}>{prediction.name}</span>
                                        </div>
                                        <span className={styles.assetType}>{prediction.assetType}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={`${styles.direction} ${getDirectionClass(prediction.direction)}`}>
                                        {getDirectionIcon(prediction.direction)}
                                        <span>{prediction.direction}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.confidenceCell}>
                                        <div className={styles.confidenceBar}>
                                            <div
                                                className={styles.confidenceFill}
                                                style={{
                                                    width: `${prediction.confidence * 100}%`,
                                                    background: prediction.confidence > 0.7 ? 'var(--success)' :
                                                        prediction.confidence > 0.5 ? 'var(--warning)' : 'var(--danger)'
                                                }}
                                            ></div>
                                        </div>
                                        <span>{(prediction.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.modelsCell}>
                                        {prediction.models.map((model, idx) => (
                                            <div
                                                key={idx}
                                                className={`${styles.modelDot} ${getDirectionClass(model.direction)}`}
                                                title={`${model.name}: ${model.direction} (${(model.confidence * 100).toFixed(0)}%)`}
                                            ></div>
                                        ))}
                                        <span className={styles.modelCount}>
                                            {prediction.models.filter(m => m.direction === prediction.direction).length}/
                                            {prediction.models.length}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.horizon}>{prediction.horizon}</span>
                                </td>
                                <td>
                                    <span className={`${styles.risk} ${getRiskClass(prediction.riskLevel)}`}>
                                        {prediction.riskLevel}
                                    </span>
                                </td>
                                <td>
                                    <button className={`${styles.actionBtn} ${getDirectionClass(prediction.direction)}`}>
                                        {prediction.direction === 'bullish' ? <ArrowUpRight size={14} /> :
                                            prediction.direction === 'bearish' ? <ArrowDownRight size={14} /> : null}
                                        {prediction.suggestedAction}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={`${styles.modelDot} ${styles.bullish}`}></div>
                    <span>Bullish</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.modelDot} ${styles.bearish}`}></div>
                    <span>Bearish</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.modelDot} ${styles.neutral}`}></div>
                    <span>Neutral</span>
                </div>
            </div>
        </div>
    );
}
