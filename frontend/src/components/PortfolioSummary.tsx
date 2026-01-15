'use client';

import { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    RefreshCw,
    Eye,
    EyeOff,
    Sparkles
} from 'lucide-react';
import styles from './PortfolioSummary.module.css';

interface Holding {
    symbol: string;
    name: string;
    type: 'stock' | 'crypto';
    quantity: number;
    avgCost: number;
    currentPrice: number;
    value: number;
    profitLoss: number;
    profitLossPercent: number;
    allocation: number;
}

const mockHoldings: Holding[] = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        quantity: 50,
        avgCost: 165.00,
        currentPrice: 185.50,
        value: 9275.00,
        profitLoss: 1025.00,
        profitLossPercent: 12.42,
        allocation: 25.5
    },
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        quantity: 0.25,
        avgCost: 38000.00,
        currentPrice: 43521.00,
        value: 10880.25,
        profitLoss: 1380.25,
        profitLossPercent: 14.53,
        allocation: 29.9
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA',
        type: 'stock',
        quantity: 15,
        avgCost: 450.00,
        currentPrice: 685.50,
        value: 10282.50,
        profitLoss: 3532.50,
        profitLossPercent: 52.33,
        allocation: 28.3
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        quantity: 2.5,
        avgCost: 2100.00,
        currentPrice: 2284.00,
        value: 5710.00,
        profitLoss: 460.00,
        profitLossPercent: 8.76,
        allocation: 15.7
    },
];

const mockWatchlist = [
    { symbol: 'TSLA', name: 'Tesla', price: 245.50, change: -2.35 },
    { symbol: 'SOL', name: 'Solana', price: 98.45, change: 5.23 },
    { symbol: 'MSFT', name: 'Microsoft', price: 402.80, change: 0.85 },
    { symbol: 'GOOGL', name: 'Alphabet', price: 141.25, change: 1.12 },
];

export default function PortfolioSummary() {
    const [showValues, setShowValues] = useState(true);
    const [activeTab, setActiveTab] = useState<'holdings' | 'watchlist'>('holdings');

    const totalValue = mockHoldings.reduce((sum, h) => sum + h.value, 0);
    const totalCost = mockHoldings.reduce((sum, h) => sum + (h.quantity * h.avgCost), 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = (totalPnL / totalCost) * 100;

    const stocksValue = mockHoldings.filter(h => h.type === 'stock').reduce((sum, h) => sum + h.value, 0);
    const cryptoValue = mockHoldings.filter(h => h.type === 'crypto').reduce((sum, h) => sum + h.value, 0);

    const formatValue = (value: number) => {
        return showValues ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••';
    };

    return (
        <div className={styles.container}>
            {/* Portfolio Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Portfolio</h2>
                    <p>Track your holdings and performance</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.iconBtn}
                        onClick={() => setShowValues(!showValues)}
                    >
                        {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button className={styles.iconBtn}>
                        <RefreshCw size={18} />
                    </button>
                    <button className={styles.addBtn}>
                        <Plus size={18} />
                        Add Asset
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard + ' ' + styles.mainStat}>
                    <div className={styles.statHeader}>
                        <Wallet size={20} />
                        <span>Total Value</span>
                    </div>
                    <div className={styles.statValue}>{formatValue(totalValue)}</div>
                    <div className={`${styles.statChange} ${totalPnL >= 0 ? styles.positive : styles.negative}`}>
                        {totalPnL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {formatValue(Math.abs(totalPnL))} ({totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <TrendingUp size={18} />
                        <span>Day Change</span>
                    </div>
                    <div className={`${styles.statValue} ${styles.positive}`}>+$523.45</div>
                    <div className={`${styles.statChange} ${styles.positive}`}>+1.45%</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <PieChart size={18} />
                        <span>Diversification</span>
                    </div>
                    <div className={styles.statValue}>7.5/10</div>
                    <div className={styles.statChange}>Good balance</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Sparkles size={18} />
                        <span>AI Score</span>
                    </div>
                    <div className={styles.statValue}>78</div>
                    <div className={styles.statChange}>Portfolio health</div>
                </div>
            </div>

            {/* Allocation Chart */}
            <div className={styles.allocationSection}>
                <h3>Asset Allocation</h3>
                <div className={styles.allocationContent}>
                    <div className={styles.allocationBar}>
                        <div
                            className={styles.allocationSegment}
                            style={{
                                width: `${(stocksValue / totalValue) * 100}%`,
                                background: 'var(--gradient-primary)'
                            }}
                        ></div>
                        <div
                            className={styles.allocationSegment}
                            style={{
                                width: `${(cryptoValue / totalValue) * 100}%`,
                                background: 'var(--gradient-success)'
                            }}
                        ></div>
                    </div>
                    <div className={styles.allocationLegend}>
                        <div className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: 'var(--primary-500)' }}></span>
                            <span>Stocks ({((stocksValue / totalValue) * 100).toFixed(1)}%)</span>
                            <span className={styles.legendValue}>{formatValue(stocksValue)}</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: 'var(--success)' }}></span>
                            <span>Crypto ({((cryptoValue / totalValue) * 100).toFixed(1)}%)</span>
                            <span className={styles.legendValue}>{formatValue(cryptoValue)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Holdings/Watchlist Tabs */}
            <div className={styles.tabSection}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'holdings' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('holdings')}
                    >
                        Holdings ({mockHoldings.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'watchlist' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('watchlist')}
                    >
                        Watchlist ({mockWatchlist.length})
                    </button>
                </div>

                {activeTab === 'holdings' ? (
                    <div className={styles.holdingsTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Qty</th>
                                    <th>Avg Cost</th>
                                    <th>Current</th>
                                    <th>Value</th>
                                    <th>P/L</th>
                                    <th>Allocation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockHoldings.map((holding) => (
                                    <tr key={holding.symbol}>
                                        <td>
                                            <div className={styles.assetCell}>
                                                <div className={styles.assetIcon}>
                                                    {holding.symbol.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className={styles.assetSymbol}>{holding.symbol}</span>
                                                    <span className={styles.assetName}>{holding.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{holding.quantity}</td>
                                        <td>${holding.avgCost.toLocaleString()}</td>
                                        <td>${holding.currentPrice.toLocaleString()}</td>
                                        <td className={styles.valueCell}>{formatValue(holding.value)}</td>
                                        <td>
                                            <div className={`${styles.pnlCell} ${holding.profitLoss >= 0 ? styles.positive : styles.negative}`}>
                                                {holding.profitLoss >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                <span>{formatValue(Math.abs(holding.profitLoss))}</span>
                                                <span className={styles.pnlPercent}>
                                                    ({holding.profitLoss >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%)
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.allocationCell}>
                                                <div className={styles.miniBar}>
                                                    <div
                                                        className={styles.miniFill}
                                                        style={{ width: `${holding.allocation}%` }}
                                                    ></div>
                                                </div>
                                                <span>{holding.allocation.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.watchlistGrid}>
                        {mockWatchlist.map((item) => (
                            <div key={item.symbol} className={styles.watchlistCard}>
                                <div className={styles.watchlistHeader}>
                                    <div className={styles.watchlistIcon}>
                                        {item.symbol.charAt(0)}
                                    </div>
                                    <div>
                                        <span className={styles.watchlistSymbol}>{item.symbol}</span>
                                        <span className={styles.watchlistName}>{item.name}</span>
                                    </div>
                                </div>
                                <div className={styles.watchlistPrice}>
                                    <span className={styles.price}>${item.price.toLocaleString()}</span>
                                    <span className={`${styles.change} ${item.change >= 0 ? styles.positive : styles.negative}`}>
                                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                                    </span>
                                </div>
                                <button className={styles.buyBtn}>
                                    <Plus size={14} />
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
