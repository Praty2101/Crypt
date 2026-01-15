'use client';

import { useState } from 'react';
import { Database, Download, Search, Filter, Table, BarChart2, Clock, Star, Lock } from 'lucide-react';
import styles from './DatasetsPage.module.css';

interface Dataset {
    id: string;
    name: string;
    description: string;
    rows: string;
    updated: string;
    category: string;
    premium: boolean;
    starred: boolean;
}

const datasets: Dataset[] = [
    { id: '1', name: 'Bitcoin Price History', description: 'Historical BTC price data with OHLCV from 2010', rows: '5.2M', updated: '1 min ago', category: 'Price', premium: false, starred: true },
    { id: '2', name: 'Ethereum Gas Tracker', description: 'Real-time and historical ETH gas prices', rows: '12.8M', updated: '30 sec ago', category: 'Network', premium: false, starred: false },
    { id: '3', name: 'DeFi TVL by Protocol', description: 'Total Value Locked across all DeFi protocols', rows: '890K', updated: '5 min ago', category: 'DeFi', premium: true, starred: true },
    { id: '4', name: 'NFT Sales Volume', description: 'NFT marketplace sales data across chains', rows: '3.4M', updated: '10 min ago', category: 'NFT', premium: true, starred: false },
    { id: '5', name: 'Exchange Reserves', description: 'Crypto reserves across major exchanges', rows: '1.2M', updated: '15 min ago', category: 'Exchange', premium: true, starred: false },
    { id: '6', name: 'Stablecoin Supply', description: 'Circulating supply of major stablecoins', rows: '450K', updated: '1 hour ago', category: 'Stablecoin', premium: false, starred: false },
    { id: '7', name: 'Wallet Addresses', description: 'Active wallet addresses by chain', rows: '28.5M', updated: '2 hours ago', category: 'Network', premium: true, starred: false },
    { id: '8', name: 'Token Unlocks Schedule', description: 'Upcoming token unlock events', rows: '2.1K', updated: '1 day ago', category: 'Token', premium: false, starred: true },
];

export default function DatasetsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [starredOnly, setStarredOnly] = useState(false);
    const [starredDatasets, setStarredDatasets] = useState<string[]>(
        datasets.filter(d => d.starred).map(d => d.id)
    );

    const toggleStar = (id: string) => {
        setStarredDatasets(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const filteredDatasets = datasets.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStarred = starredOnly ? starredDatasets.includes(d.id) : true;
        return matchesSearch && matchesStarred;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Database size={24} />
                    <div>
                        <h1>Datasets</h1>
                        <p>Access real-time and historical crypto data</p>
                    </div>
                </div>
                <span className={styles.newBadge}>NEW</span>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Search datasets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    className={`${styles.toolBtn} ${starredOnly ? styles.active : ''}`}
                    onClick={() => setStarredOnly(!starredOnly)}
                >
                    <Star size={14} />
                    Starred
                </button>
                <button className={styles.toolBtn}>
                    <Filter size={14} />
                    Filter
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Dataset</th>
                            <th>Category</th>
                            <th>Rows</th>
                            <th>Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDatasets.map(dataset => (
                            <tr key={dataset.id}>
                                <td>
                                    <button
                                        className={`${styles.starBtn} ${starredDatasets.includes(dataset.id) ? styles.starred : ''}`}
                                        onClick={() => toggleStar(dataset.id)}
                                    >
                                        <Star size={14} />
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.datasetInfo}>
                                        <div className={styles.datasetIcon}>
                                            <Table size={16} />
                                        </div>
                                        <div>
                                            <span className={styles.datasetName}>
                                                {dataset.name}
                                                {dataset.premium && <Lock size={10} className={styles.lockIcon} />}
                                            </span>
                                            <span className={styles.datasetDesc}>{dataset.description}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.category}>{dataset.category}</span>
                                </td>
                                <td className={styles.rows}>{dataset.rows}</td>
                                <td className={styles.updated}>
                                    <Clock size={12} />
                                    {dataset.updated}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} title="Preview">
                                            <BarChart2 size={14} />
                                        </button>
                                        <button className={styles.actionBtn} title="Download">
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
