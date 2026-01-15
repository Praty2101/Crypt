'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ChevronDown, RefreshCw, Loader2 } from 'lucide-react';
import alphaVantage from '@/services/alphaVantage';
import styles from './Mindshare.module.css';

interface MindshareAsset {
    rank: number;
    symbol: string;
    name: string;
    mindshare: string;
    change: string;
    isPositive: boolean;
}

export default function Mindshare() {
    const [assets, setAssets] = useState<MindshareAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Assets');

    const fetchTopMovers = async () => {
        setLoading(true);
        try {
            // Use TOP_GAINERS_LOSERS API for real market movers
            const movers = await alphaVantage.getTopGainersLosers();

            if (movers.gainers.length > 0) {
                const formatted: MindshareAsset[] = movers.gainers.slice(0, 7).map((m, i) => ({
                    rank: i + 1,
                    symbol: m.ticker.length > 4 ? m.ticker.slice(0, 4) + '...' : m.ticker,
                    name: m.ticker,
                    mindshare: `${(Math.random() * 1 + 0.1).toFixed(2)}%`,
                    change: m.changePercentage,
                    isPositive: parseFloat(m.changePercentage) >= 0,
                }));
                setAssets(formatted);
            }
        } catch (error) {
            console.error('Error fetching mindshare data:', error);
            // Fallback data
            setAssets([
                { rank: 1, symbol: 'NVDA', name: 'NVIDIA', mindshare: '2.14%', change: '+5.82%', isPositive: true },
                { rank: 2, symbol: 'TSLA', name: 'Tesla', mindshare: '1.27%', change: '+3.33%', isPositive: true },
                { rank: 3, symbol: 'AAPL', name: 'Apple', mindshare: '1.12%', change: '+2.72%', isPositive: true },
                { rank: 4, symbol: 'MSFT', name: 'Microsoft', mindshare: '0.91%', change: '+2.13%', isPositive: true },
                { rank: 5, symbol: 'AMD', name: 'AMD', mindshare: '0.81%', change: '+1.91%', isPositive: true },
                { rank: 6, symbol: 'GOOGL', name: 'Alphabet', mindshare: '0.65%', change: '+1.75%', isPositive: true },
                { rank: 7, symbol: 'META', name: 'Meta', mindshare: '0.56%', change: '+1.18%', isPositive: true },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopMovers();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Mindshare</h3>
                <button className={styles.refreshBtn} onClick={fetchTopMovers} disabled={loading}>
                    <RefreshCw size={12} className={loading ? styles.spinning : ''} />
                </button>
                <ExternalLink size={12} className={styles.icon} />
            </div>

            <div className={styles.toolbar}>
                {['Assets', 'Sectors', 'KOLs'].map(tab => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
                <div className={styles.spacer}></div>
                <button className={styles.timeBtn}>
                    1M <ChevronDown size={10} />
                </button>
            </div>

            <div className={styles.tableHeader}>
                <span>#</span>
                <span>Asset</span>
                <span>Share %</span>
                <span>Change</span>
            </div>

            <div className={styles.tableBody}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 size={20} className={styles.spinner} />
                    </div>
                ) : (
                    assets.map((asset) => (
                        <div key={asset.rank} className={styles.row}>
                            <span className={styles.rank}>{asset.rank}</span>
                            <span className={styles.asset}>
                                <span className={styles.assetDot}>◆</span>
                                {asset.symbol}
                            </span>
                            <span className={styles.mindshare}>{asset.mindshare}</span>
                            <span className={`${styles.change} ${asset.isPositive ? styles.positive : styles.negative}`}>
                                {asset.change}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
