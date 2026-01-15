'use client';

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Bookmark, Share2, Search, RefreshCw, Loader2 } from 'lucide-react';
import alphaVantage from '@/services/alphaVantage';
import styles from './NewsPage.module.css';

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    time: string;
    category: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    url: string;
    tickers: string[];
    bannerImage?: string;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Crypto', 'Stocks', 'Forex', 'Economy'];

    const fetchNews = async () => {
        setLoading(true);
        try {
            // Use NEWS_SENTIMENT API for real news
            const tickers = activeCategory === 'Crypto'
                ? 'CRYPTO:BTC,CRYPTO:ETH'
                : activeCategory === 'Stocks'
                    ? 'AAPL,MSFT,GOOGL,NVDA'
                    : undefined;

            const articles = await alphaVantage.getNewsSentiment(tickers, activeCategory.toLowerCase());

            if (articles && articles.length > 0) {
                const formatted: NewsItem[] = articles.map((article, index) => {
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

                        if (diffMins < 60) timeStr = `${diffMins}m ago`;
                        else if (diffHours < 24) timeStr = `${diffHours}h ago`;
                        else timeStr = `${Math.floor(diffHours / 24)}d ago`;
                    }

                    // Map sentiment
                    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
                    if (article.sentiment === 'Bullish' || article.sentimentScore > 0.15) sentiment = 'bullish';
                    else if (article.sentiment === 'Bearish' || article.sentimentScore < -0.15) sentiment = 'bearish';

                    return {
                        id: index.toString(),
                        title: article.title,
                        summary: article.summary,
                        source: article.source,
                        time: timeStr,
                        category: activeCategory,
                        sentiment,
                        url: article.url,
                        tickers: article.tickers.map(t => t.ticker),
                        bannerImage: article.bannerImage,
                    };
                });

                setNews(formatted);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            // Fallback
            setNews([
                { id: '1', title: 'Markets Rally on Fed Comments', summary: 'Stock markets surge after Federal Reserve signals potential rate cuts...', source: 'Reuters', time: '1h ago', category: 'Stocks', sentiment: 'bullish', url: '#', tickers: ['SPY', 'QQQ'] },
                { id: '2', title: 'Bitcoin Breaks $95K Resistance', summary: 'Bitcoin continues its upward momentum, breaking through key resistance levels...', source: 'CoinDesk', time: '2h ago', category: 'Crypto', sentiment: 'bullish', url: '#', tickers: ['BTC'] },
                { id: '3', title: 'Oil Prices Decline on Demand Concerns', summary: 'Crude oil prices fell as concerns over global demand continue to weigh...', source: 'Bloomberg', time: '3h ago', category: 'Economy', sentiment: 'bearish', url: '#', tickers: ['WTI'] },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [activeCategory]);

    const filteredNews = searchQuery
        ? news.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : news;

    const openArticle = (url: string) => {
        if (url && url !== '#') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Newspaper size={24} />
                    <div>
                        <h1>Market News</h1>
                        <p>Real-time news with AI sentiment analysis</p>
                    </div>
                </div>
                <button className={styles.refreshBtn} onClick={fetchNews} disabled={loading}>
                    <RefreshCw size={16} className={loading ? styles.spinning : ''} />
                    Refresh
                </button>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.categories}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className={styles.searchBox}>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search news..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.newsList}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 size={32} className={styles.spinner} />
                        <span>Loading market news...</span>
                    </div>
                ) : (
                    filteredNews.map(item => (
                        <article key={item.id} className={styles.newsCard} onClick={() => openArticle(item.url)}>
                            {item.bannerImage && (
                                <div className={styles.newsImage}>
                                    <img src={item.bannerImage} alt="" />
                                </div>
                            )}
                            <div className={styles.newsContent}>
                                <div className={styles.newsMeta}>
                                    <span className={styles.source}>{item.source}</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.time}>{item.time}</span>
                                    <span className={`${styles.sentiment} ${styles[item.sentiment]}`}>
                                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                                    </span>
                                </div>
                                <h2 className={styles.newsTitle}>{item.title}</h2>
                                <p className={styles.newsSummary}>{item.summary}</p>
                                {item.tickers.length > 0 && (
                                    <div className={styles.tickers}>
                                        {item.tickers.slice(0, 5).map(ticker => (
                                            <span key={ticker} className={styles.ticker}>{ticker}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.newsActions}>
                                <button className={styles.actionBtn}><Bookmark size={16} /></button>
                                <button className={styles.actionBtn}><Share2 size={16} /></button>
                                <button className={styles.actionBtn}><ExternalLink size={16} /></button>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
