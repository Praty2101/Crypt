'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Search, RefreshCw, Loader2 } from 'lucide-react';
import alphaVantage from '@/services/alphaVantage';
import styles from './NewsFeed.module.css';

interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    url: string;
}

// Fallback news data
const fallbackNews: NewsItem[] = [
    { id: '1', title: "Bitcoin ETFs post largest single-day inflows, worth $750 million", source: "The Block", time: "42m", sentiment: 'bullish', url: '#' },
    { id: '2', title: "Dogecoin jumps nearly 9% as buyers push price higher", source: "CoinDesk", time: "1h", sentiment: 'bullish', url: '#' },
    { id: '3', title: "Ethereum Could Be Ready to Outperform Bitcoin in 2026", source: "Decrypt", time: "2h", sentiment: 'bullish', url: '#' },
    { id: '4', title: "Solana DEX volume hits all-time high", source: "The Block", time: "3h", sentiment: 'bullish', url: '#' },
    { id: '5', title: "SEC signals more crypto enforcement actions", source: "Reuters", time: "4h", sentiment: 'bearish', url: '#' },
];

export default function NewsFeed() {
    const [news, setNews] = useState<NewsItem[]>(fallbackNews);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('Latest');

    const fetchNews = async () => {
        setRefreshing(true);
        try {
            // Use NEWS_SENTIMENT API for crypto news
            const articles = await alphaVantage.getNewsSentiment('CRYPTO:BTC,CRYPTO:ETH', 'blockchain');

            if (articles && articles.length > 0) {
                const formattedNews: NewsItem[] = articles.map((article, index) => {
                    // Parse time
                    let timeStr = 'now';
                    if (article.publishedAt) {
                        const publishedDate = new Date(
                            article.publishedAt.replace(
                                /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
                                '$1-$2-$3T$4:$5:$6'
                            )
                        );
                        const now = new Date();
                        const diffMs = now.getTime() - publishedDate.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMins / 60);

                        if (diffMins < 60) {
                            timeStr = `${diffMins}m`;
                        } else if (diffHours < 24) {
                            timeStr = `${diffHours}h`;
                        } else {
                            timeStr = `${Math.floor(diffHours / 24)}d`;
                        }
                    }

                    // Determine sentiment from API
                    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
                    if (article.sentiment === 'Bullish' || article.sentimentScore > 0.15) {
                        sentiment = 'bullish';
                    } else if (article.sentiment === 'Bearish' || article.sentimentScore < -0.15) {
                        sentiment = 'bearish';
                    }

                    return {
                        id: index.toString(),
                        title: article.title,
                        source: article.source,
                        time: timeStr,
                        sentiment,
                        url: article.url,
                    };
                });

                setNews(formattedNews);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            // Keep fallback news on error
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNews();

        // Refresh news every 5 minutes
        const interval = setInterval(fetchNews, 300000);
        return () => clearInterval(interval);
    }, []);

    const openArticle = (url: string) => {
        if (url && url !== '#') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>News</h3>
                <div className={styles.headerActions}>
                    <button
                        className={styles.refreshBtn}
                        onClick={fetchNews}
                        disabled={refreshing}
                        title="Refresh news"
                    >
                        <RefreshCw size={12} className={refreshing ? styles.spinning : ''} />
                    </button>
                    <ExternalLink size={12} className={styles.icon} />
                </div>
            </div>

            <div className={styles.toolbar}>
                {['Latest', 'Crypto', 'Stocks'].map(tab => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
                <div className={styles.spacer}></div>
                <Search size={12} className={styles.toolIcon} />
            </div>

            <div className={styles.list}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 size={20} className={styles.spinner} />
                        <span>Loading news...</span>
                    </div>
                ) : (
                    news.map((item) => (
                        <article
                            key={item.id}
                            className={styles.item}
                            onClick={() => openArticle(item.url)}
                        >
                            <div className={styles.itemContent}>
                                <h4 className={styles.itemTitle}>{item.title}</h4>
                                <div className={styles.itemMeta}>
                                    <span>{item.time}</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.source}>{item.source}</span>
                                </div>
                            </div>
                            <div className={styles.sentiment}>
                                <span className={`${styles.sentimentDot} ${styles[item.sentiment]}`}></span>
                                <span className={`${styles.sentimentDot} ${styles[item.sentiment]}`}></span>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
