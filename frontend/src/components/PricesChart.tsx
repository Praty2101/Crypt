'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronDown, Plus, X, Maximize2, RefreshCw, Loader2, Zap } from 'lucide-react';
import alphaVantage, { TimeSeriesData, TOP_CRYPTO_SYMBOLS } from '@/services/alphaVantage';
import styles from './PricesChart.module.css';

interface Asset {
    rank: number;
    symbol: string;
    name: string;
    price: number;
    prevPrice: number;
    change24h: number;
    color: string;
    isUpdating: boolean;
}

const timeframes = ['1D', '1W', '1M', '3M', '1Y'];

export default function PricesChart() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
    const [activeTimeframe, setActiveTimeframe] = useState('1M');
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [chartData, setChartData] = useState<TimeSeriesData[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(true);
    const chartCache = useRef<Map<string, TimeSeriesData[]>>(new Map());
    const refreshIndex = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize assets from TOP_CRYPTO_SYMBOLS
    const initializeAssets = useCallback(() => {
        const initialAssets: Asset[] = TOP_CRYPTO_SYMBOLS.slice(0, 10).map((c, i) => ({
            rank: i + 1,
            symbol: c.symbol,
            name: c.name,
            price: 0,
            prevPrice: 0,
            change24h: 0,
            color: c.color,
            isUpdating: false,
        }));
        setAssets(initialAssets);
        return initialAssets;
    }, []);

    // Update a single asset's price
    const updateSingleAsset = useCallback(async (symbol: string) => {
        try {
            const quote = await alphaVantage.getCryptoExchangeRate(symbol);
            if (quote && quote.price > 0) {
                setAssets(prev => prev.map(asset =>
                    asset.symbol === symbol
                        ? {
                            ...asset,
                            prevPrice: asset.price,
                            price: quote.price,
                            isUpdating: false,
                        }
                        : asset
                ));
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.warn(`Failed to update ${symbol}:`, err);
        }
    }, []);

    // Rotating update - updates 1 asset every 15 seconds (to stay within 5 calls/min limit)
    const rotatingUpdate = useCallback(async () => {
        if (assets.length === 0) return;

        const index = refreshIndex.current % assets.length;
        const asset = assets[index];

        // Mark asset as updating
        setAssets(prev => prev.map((a, i) =>
            i === index ? { ...a, isUpdating: true } : a
        ));

        // Fetch price
        await updateSingleAsset(asset.symbol);

        refreshIndex.current = (refreshIndex.current + 1) % assets.length;
    }, [assets, updateSingleAsset]);

    // Initial full fetch
    const fetchAllPrices = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        setError(null);

        try {
            const topCryptos = await alphaVantage.getTopCryptocurrencies(10);

            const assetList: Asset[] = topCryptos.map((crypto, index) => ({
                rank: index + 1,
                symbol: crypto.symbol,
                name: crypto.name,
                price: crypto.price,
                prevPrice: 0,
                change24h: 0,
                color: crypto.color,
                isUpdating: false,
            }));

            setAssets(assetList);
            setLastUpdated(new Date());

            if (assetList.length > 0 && !selectedAsset) {
                setSelectedAsset(assetList[0].symbol);
            }
        } catch (err) {
            console.error('Error fetching prices:', err);
            if (assets.length === 0) {
                initializeAssets();
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedAsset, assets.length, initializeAssets]);

    // Fetch chart data
    const fetchChartData = useCallback(async (symbol: string, timeframe: string) => {
        const cacheKey = `${symbol}_${timeframe}`;

        if (chartCache.current.has(cacheKey)) {
            setChartData(chartCache.current.get(cacheKey)!);
            setError(null);
            return;
        }

        setChartLoading(true);

        try {
            let data: TimeSeriesData[] = [];

            switch (timeframe) {
                case '1D':
                case '1W':
                    data = await alphaVantage.getCryptoDailyTimeSeries(symbol);
                    data = data.slice(-(timeframe === '1D' ? 7 : 7));
                    break;
                case '1M':
                    data = await alphaVantage.getCryptoDailyTimeSeries(symbol);
                    data = data.slice(-30);
                    break;
                case '3M':
                    data = await alphaVantage.getCryptoDailyTimeSeries(symbol);
                    data = data.slice(-90);
                    break;
                case '1Y':
                    data = await alphaVantage.getCryptoWeeklyTimeSeries(symbol);
                    data = data.slice(-52);
                    break;
                default:
                    data = await alphaVantage.getCryptoDailyTimeSeries(symbol);
            }

            if (data && data.length > 0) {
                chartCache.current.set(cacheKey, data);
                setChartData(data);
                setError(null);
            }
        } catch (err) {
            console.error(`Error fetching chart:`, err);
        } finally {
            setChartLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        initializeAssets();
        fetchAllPrices();
    }, []);

    // Auto-refresh every 15 seconds (rotating) - respects 5 calls/min limit
    useEffect(() => {
        if (isLive && assets.length > 0) {
            intervalRef.current = setInterval(() => {
                rotatingUpdate();
            }, 15000); // 15 seconds = 4 calls/min, safely under limit
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isLive, assets.length, rotatingUpdate]);

    // Fetch chart when selected asset changes
    useEffect(() => {
        if (assets.length > 0 && selectedAsset) {
            fetchChartData(selectedAsset, activeTimeframe);
        }
    }, [assets.length, selectedAsset, activeTimeframe, fetchChartData]);

    const handleAssetClick = (symbol: string) => {
        if (symbol !== selectedAsset) {
            setSelectedAsset(symbol);
            fetchChartData(symbol, activeTimeframe);
        }
    };

    const handleTimeframeChange = (tf: string) => {
        if (tf !== activeTimeframe) {
            setActiveTimeframe(tf);
            fetchChartData(selectedAsset, tf);
        }
    };

    const toggleLive = () => {
        setIsLive(prev => !prev);
    };

    const formatPrice = (price: number) => {
        if (price === 0) return '$--';
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        if (price < 10) return `$${price.toFixed(3)}`;
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getChartPath = () => {
        if (chartData.length < 2) return "M0,140 L800,140";

        const width = 800;
        const height = 280;
        const padding = 30;

        const prices = chartData.map(d => d.close);
        const minPrice = Math.min(...prices) * 0.995;
        const maxPrice = Math.max(...prices) * 1.005;
        const priceRange = maxPrice - minPrice || 1;

        const points = chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * width;
            const y = height - padding - ((d.close - minPrice) / priceRange) * (height - padding * 2);
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        });

        return `M${points.join(' L')}`;
    };

    const calculatePriceChange = () => {
        if (chartData.length < 2) return { change: 0, percent: 0 };
        const first = chartData[0].close;
        const last = chartData[chartData.length - 1].close;
        const change = last - first;
        const percent = (change / first) * 100;
        return { change, percent };
    };

    const priceChange = calculatePriceChange();
    const selectedAssetData = assets.find(a => a.symbol === selectedAsset);
    const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : selectedAssetData?.price || 0;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2 className={styles.title}>Top 10 Cryptocurrencies</h2>
                    <button
                        className={`${styles.liveBtn} ${isLive ? styles.liveActive : ''}`}
                        onClick={toggleLive}
                        title={isLive ? 'Live updates ON (every 5s)' : 'Live updates OFF'}
                    >
                        <Zap size={12} />
                        <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
                    </button>
                    <div className={styles.searchSmall}>
                        <Search size={12} />
                        <input type="text" placeholder="Search crypto..." />
                    </div>
                    <button
                        className={styles.refreshBtn}
                        onClick={() => {
                            chartCache.current.clear();
                            alphaVantage.clearCache();
                            fetchAllPrices(true);
                        }}
                        disabled={refreshing}
                        title="Refresh all prices"
                    >
                        <RefreshCw size={14} className={refreshing ? styles.spinning : ''} />
                    </button>
                </div>

                <div className={styles.headerRight}>
                    {lastUpdated && (
                        <span className={styles.lastUpdated}>
                            {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <div className={styles.timeframes}>
                        {timeframes.map(tf => (
                            <button
                                key={tf}
                                className={`${styles.tfBtn} ${activeTimeframe === tf ? styles.active : ''}`}
                                onClick={() => handleTimeframeChange(tf)}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                    <Maximize2 size={14} className={styles.expandIcon} />
                </div>
            </div>

            {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

            {/* Content */}
            <div className={styles.content}>
                {/* Left: Price Table */}
                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <span className={styles.colRank}>#</span>
                        <span className={styles.colAsset}>Asset</span>
                        <span className={styles.colPrice}>Price (USD)</span>
                        <span className={styles.colChange}>Status</span>
                    </div>
                    <div className={styles.tableBody}>
                        {loading ? (
                            <div className={styles.loadingState}>
                                <Loader2 size={24} className={styles.spinner} />
                                <span>Fetching top cryptocurrencies...</span>
                            </div>
                        ) : (
                            assets.map((asset) => (
                                <div
                                    key={asset.symbol}
                                    className={`${styles.tableRow} ${selectedAsset === asset.symbol ? styles.selected : ''} ${asset.isUpdating ? styles.updating : ''}`}
                                    onClick={() => handleAssetClick(asset.symbol)}
                                >
                                    <span className={styles.colRank}>{asset.rank}</span>
                                    <span className={styles.colAsset}>
                                        <span className={styles.assetColor} style={{ background: asset.color }}></span>
                                        <span className={styles.assetSymbol}>{asset.symbol}</span>
                                        <span className={styles.assetName}>{asset.name}</span>
                                    </span>
                                    <span className={`${styles.colPrice} ${asset.price > asset.prevPrice && asset.prevPrice > 0 ? styles.priceUp : ''} ${asset.price < asset.prevPrice && asset.prevPrice > 0 ? styles.priceDown : ''}`}>
                                        {formatPrice(asset.price)}
                                    </span>
                                    <span className={`${styles.colChange} ${asset.price > 0 ? styles.positive : ''}`}>
                                        {asset.isUpdating ? (
                                            <Loader2 size={12} className={styles.miniSpinner} />
                                        ) : asset.price > 0 ? (
                                            <span className={styles.liveDot}>●</span>
                                        ) : (
                                            '--'
                                        )}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Chart */}
                <div className={styles.chartSection}>
                    <div className={styles.chartToolbar}>
                        <div className={styles.chartTabs}>
                            <button className={`${styles.chartTab} ${styles.active}`}>Price</button>
                            <button className={styles.chartTab}>Volume</button>
                            <button className={styles.chartTab}>Mcap</button>
                        </div>
                        <span className={styles.chartOption}>Alpha Vantage API</span>
                        <div className={styles.selectedTags}>
                            <span className={styles.tag}>
                                <span className={styles.tagColor} style={{ background: selectedAssetData?.color }}></span>
                                {selectedAsset} - {selectedAssetData?.name}
                                {chartLoading && <Loader2 size={10} className={styles.tagSpinner} />}
                            </span>
                        </div>
                    </div>

                    <div className={styles.chartArea}>
                        {chartLoading ? (
                            <div className={styles.chartLoadingOverlay}>
                                <Loader2 size={32} className={styles.spinner} />
                                <span>Loading {selectedAsset} chart...</span>
                            </div>
                        ) : (
                            <>
                                <div className={styles.chartTooltip}>
                                    <span className={styles.tooltipDate}>
                                        {chartData.length > 0
                                            ? new Date(chartData[chartData.length - 1].timestamp).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })
                                            : 'No data'}
                                    </span>
                                    <div className={styles.tooltipRow}>
                                        <span className={styles.tooltipColor} style={{ background: selectedAssetData?.color }}></span>
                                        <span>{selectedAsset}</span>
                                        <span>{formatPrice(currentPrice)}</span>
                                        <span className={priceChange.percent >= 0 ? styles.positive : styles.negative}>
                                            {priceChange.percent >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>

                                <svg className={styles.chartSvg} viewBox="0 0 800 280" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id={`gradient-${selectedAsset}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor={selectedAssetData?.color || '#f7931a'} stopOpacity="0.3" />
                                            <stop offset="100%" stopColor={selectedAssetData?.color || '#f7931a'} stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={getChartPath()} fill="none" stroke={selectedAssetData?.color || '#f7931a'} strokeWidth="2" />
                                    <path d={`${getChartPath()} L800,280 L0,280 Z`} fill={`url(#gradient-${selectedAsset})`} />
                                </svg>

                                <div className={styles.chartLabels}>
                                    <span className={priceChange.percent >= 0 ? styles.labelPositive : styles.labelNegative}>
                                        {priceChange.percent >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%
                                    </span>
                                </div>
                            </>
                        )}
                        <div className={styles.watermark}>Crypt</div>
                    </div>

                    <div className={styles.timeAxis}>
                        {chartData.length > 0
                            ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 6) === 0).map(d => (
                                <span key={d.timestamp}>
                                    {new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            ))
                            : ['--', '--', '--', '--', '--', '--'].map((t, i) => <span key={i}>{t}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
