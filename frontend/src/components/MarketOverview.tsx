'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import alphaVantage from '@/services/alphaVantage';
import styles from './MarketOverview.module.css';

interface MarketData {
    btcPrice: number;
    ethPrice: number;
    btcChange: number;
    ethChange: number;
    totalMarketCap: string;
    totalVolume: string;
    btcDominance: number;
    ethDominance: number;
    fearGreedIndex: number;
    fearGreedLabel: string;
    topGainers: { ticker: string; change: string }[];
    topLosers: { ticker: string; change: string }[];
}

export default function MarketOverview() {
    const [data, setData] = useState<MarketData>({
        btcPrice: 0,
        ethPrice: 0,
        btcChange: 0,
        ethChange: 0,
        totalMarketCap: '--',
        totalVolume: '--',
        btcDominance: 55.21,
        ethDominance: 11.7,
        fearGreedIndex: 72,
        fearGreedLabel: 'Greed',
        topGainers: [],
        topLosers: [],
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMarketData = async () => {
        setRefreshing(true);
        try {
            // Fetch BTC and ETH prices using CURRENCY_EXCHANGE_RATE
            const [btcQuote, ethQuote] = await Promise.all([
                alphaVantage.getCryptoExchangeRate('BTC'),
                alphaVantage.getCryptoExchangeRate('ETH'),
            ]);

            // Fetch top gainers/losers using TOP_GAINERS_LOSERS
            const movers = await alphaVantage.getTopGainersLosers();

            // Calculate market cap (estimated from BTC price and dominance)
            const btcPrice = btcQuote?.price || 0;
            const ethPrice = ethQuote?.price || 0;
            const estimatedMarketCap = btcPrice > 0 ? (btcPrice * 19500000) / 0.55 : 0;

            setData(prev => ({
                ...prev,
                btcPrice,
                ethPrice,
                totalMarketCap: estimatedMarketCap > 1e12
                    ? `$${(estimatedMarketCap / 1e12).toFixed(2)}T`
                    : estimatedMarketCap > 1e9
                        ? `$${(estimatedMarketCap / 1e9).toFixed(0)}B`
                        : '--',
                totalVolume: '$54B', // This would need a different API
                topGainers: movers.gainers.slice(0, 3).map(g => ({
                    ticker: g.ticker,
                    change: g.changePercentage
                })),
                topLosers: movers.losers.slice(0, 3).map(l => ({
                    ticker: l.ticker,
                    change: l.changePercentage
                })),
            }));
        } catch (error) {
            console.error('Error fetching market data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
        const interval = setInterval(fetchMarketData, 300000); // 5 min refresh
        return () => clearInterval(interval);
    }, []);

    const formatPrice = (price: number) => {
        if (price === 0) return '$--';
        return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Market Overview 24H</h3>
                <div className={styles.headerActions}>
                    <button
                        className={styles.refreshBtn}
                        onClick={fetchMarketData}
                        disabled={refreshing}
                    >
                        <RefreshCw size={12} className={refreshing ? styles.spinning : ''} />
                    </button>
                    <ExternalLink size={12} className={styles.icon} />
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingState}>
                    <Loader2 size={20} className={styles.spinner} />
                </div>
            ) : (
                <>
                    {/* Main Metrics */}
                    <div className={styles.metrics}>
                        <div className={styles.metric}>
                            <span className={styles.label}>Marketcap</span>
                            <span className={styles.value}>{data.totalMarketCap}</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.label}>Volume</span>
                            <span className={styles.value}>{data.totalVolume}</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.label}>BTC Dom</span>
                            <span className={styles.value}>{data.btcDominance.toFixed(1)}%</span>
                        </div>
                        <div className={styles.metric}>
                            <span className={styles.label}>ETH Dom</span>
                            <span className={styles.valueSmall}>{data.ethDominance}%</span>
                        </div>
                    </div>

                    {/* Live Prices */}
                    <div className={styles.prices}>
                        <div className={styles.priceItem}>
                            <span className={styles.priceLabel}>BTC</span>
                            <span className={styles.priceValue}>{formatPrice(data.btcPrice)}</span>
                        </div>
                        <div className={styles.priceItem}>
                            <span className={styles.priceLabel}>ETH</span>
                            <span className={styles.priceValue}>{formatPrice(data.ethPrice)}</span>
                        </div>
                    </div>

                    {/* Fear & Greed Index */}
                    <div className={styles.fearGreed}>
                        <span className={styles.fgLabel}>Fear & Greed</span>
                        <div className={styles.meterWrapper}>
                            <div className={styles.meter}>
                                <div className={styles.meterThumb} style={{ left: `${data.fearGreedIndex}%` }}></div>
                            </div>
                        </div>
                        <span className={styles.fgValue}>{data.fearGreedIndex}</span>
                        <span className={styles.fgStatus}>{data.fearGreedLabel}</span>
                    </div>

                    {/* Top Movers */}
                    {data.topGainers.length > 0 && (
                        <div className={styles.movers}>
                            <div className={styles.moverSection}>
                                <span className={styles.moverTitle}>
                                    <TrendingUp size={12} /> Top Gainers
                                </span>
                                {data.topGainers.map((g, i) => (
                                    <div key={i} className={styles.moverItem}>
                                        <span>{g.ticker}</span>
                                        <span className={styles.positive}>{g.change}</span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.moverSection}>
                                <span className={styles.moverTitle}>
                                    <TrendingDown size={12} /> Top Losers
                                </span>
                                {data.topLosers.map((l, i) => (
                                    <div key={i} className={styles.moverItem}>
                                        <span>{l.ticker}</span>
                                        <span className={styles.negative}>{l.change}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
