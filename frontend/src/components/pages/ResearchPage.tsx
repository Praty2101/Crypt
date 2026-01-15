'use client';

import { useState } from 'react';
import { FileText, Calendar, User, ChevronRight, Bookmark, Download, Share2, Filter } from 'lucide-react';
import styles from './ResearchPage.module.css';

interface Report {
    id: string;
    title: string;
    author: string;
    date: string;
    category: string;
    thumbnail: string;
    excerpt: string;
    readTime: string;
    premium: boolean;
}

const reports: Report[] = [
    { id: '1', title: 'Stellar Financial Ecosystem Update Q1 2026', author: 'Matt Kreiser', date: 'Jan 12, 2026', category: 'Ecosystem', thumbnail: '📊', excerpt: 'A comprehensive analysis of the Stellar ecosystem growth, transaction volumes, and upcoming protocol upgrades.', readTime: '12 min', premium: false },
    { id: '2', title: 'Pyth: Pricing the World and Capturing the Value', author: 'Whynohen', date: 'Jan 10, 2026', category: 'DeFi', thumbnail: '💰', excerpt: 'Deep dive into Pyth Network oracle infrastructure and its expanding role in DeFi price discovery.', readTime: '18 min', premium: true },
    { id: '3', title: 'Stable: Mainnet and Token Generation Event', author: 'Shale Ferdana', date: 'Jan 8, 2026', category: 'Protocol', thumbnail: '🔗', excerpt: 'Analysis of Stable protocol mainnet launch and TGE implications for the stablecoin market.', readTime: '8 min', premium: false },
    { id: '4', title: 'Bitcoin ETF Flows: January 2026 Analysis', author: 'Sarah Chen', date: 'Jan 6, 2026', category: 'Institutions', thumbnail: '📈', excerpt: 'Tracking institutional Bitcoin ETF inflows and their impact on market structure.', readTime: '15 min', premium: true },
    { id: '5', title: 'Ethereum Layer 2 Scaling Wars: 2026 Edition', author: 'Alex Morgan', date: 'Jan 4, 2026', category: 'Infrastructure', thumbnail: '⚡', excerpt: 'Comparative analysis of Arbitrum, Optimism, Base, and emerging L2 solutions.', readTime: '22 min', premium: true },
    { id: '6', title: 'Solana DeFi Renaissance: TVL Breakdown', author: 'David Park', date: 'Jan 2, 2026', category: 'DeFi', thumbnail: '☀️', excerpt: 'Examining the resurgence of Solana DeFi protocols and capital flows.', readTime: '14 min', premium: false },
];

const categories = ['All', 'DeFi', 'Infrastructure', 'Ecosystem', 'Protocol', 'Institutions'];

export default function ResearchPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [savedReports, setSavedReports] = useState<string[]>([]);

    const filteredReports = activeCategory === 'All'
        ? reports
        : reports.filter(r => r.category === activeCategory);

    const toggleSave = (id: string) => {
        setSavedReports(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <FileText size={24} />
                    <div>
                        <h1>Research</h1>
                        <p>In-depth analysis and reports from our research team</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.filterBtn}>
                        <Filter size={14} />
                        Filter
                    </button>
                </div>
            </div>

            <div className={styles.categories}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`${styles.catBtn} ${activeCategory === cat ? styles.active : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className={styles.reportGrid}>
                {filteredReports.map(report => (
                    <article key={report.id} className={styles.reportCard}>
                        <div className={styles.cardThumb}>{report.thumbnail}</div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardMeta}>
                                <span className={styles.category}>{report.category}</span>
                                {report.premium && <span className={styles.premium}>PRO</span>}
                            </div>
                            <h3 className={styles.cardTitle}>{report.title}</h3>
                            <p className={styles.cardExcerpt}>{report.excerpt}</p>
                            <div className={styles.cardFooter}>
                                <div className={styles.authorInfo}>
                                    <User size={12} />
                                    <span>{report.author}</span>
                                    <span className={styles.dot}>•</span>
                                    <Calendar size={12} />
                                    <span>{report.date}</span>
                                    <span className={styles.dot}>•</span>
                                    <span>{report.readTime}</span>
                                </div>
                                <div className={styles.cardActions}>
                                    <button
                                        className={`${styles.actionBtn} ${savedReports.includes(report.id) ? styles.saved : ''}`}
                                        onClick={() => toggleSave(report.id)}
                                    >
                                        <Bookmark size={14} />
                                    </button>
                                    <button className={styles.actionBtn}><Share2 size={14} /></button>
                                    <button className={styles.actionBtn}><Download size={14} /></button>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={16} className={styles.arrow} />
                    </article>
                ))}
            </div>
        </div>
    );
}
