'use client';

import { useState } from 'react';
import { Eye, Plus, Search, TrendingUp, TrendingDown, Bell, X, Star, BarChart2 } from 'lucide-react';
import styles from './WatchlistPage.module.css';

interface WatchlistItem {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    volume: string;
    marketCap: string;
    alert?: number;
    starred: boolean;
}

const watchlistItems: WatchlistItem[] = [
    { id: '1', symbol: 'BTC', name: 'Bitcoin', price: 95234.12, change24h: 2.35, volume: '$45.2B', marketCap: '$1.87T', alert: 100000, starred: true },
    { id: '2', symbol: 'ETH', name: 'Ethereum', price: 3128.15, change24h: 1.82, volume: '$18.5B', marketCap: '$376B', alert: 3500, starred: true },
    { id: '3', symbol: 'SOL', name: 'Solana', price: 144.76, change24h: 5.23, volume: '$3.2B', marketCap: '$67B', starred: false },
    { id: '4', symbol: 'XRP', name: 'XRP', price: 2.15, change24h: 4.69, volume: '$8.1B', marketCap: '$123B', starred: false },
    { id: '5', symbol: 'AVAX', name: 'Avalanche', price: 38.50, change24h: -1.25, volume: '$890M', marketCap: '$15B', starred: false },
    { id: '6', symbol: 'LINK', name: 'Chainlink', price: 14.20, change24h: 3.45, volume: '$450M', marketCap: '$8.3B', starred: true },
    { id: '7', symbol: 'MATIC', name: 'Polygon', price: 0.89, change24h: 2.12, volume: '$380M', marketCap: '$8.9B', starred: false },
    { id: '8', symbol: 'DOT', name: 'Polkadot', price: 7.25, change24h: -0.85, volume: '$290M', marketCap: '$9.8B', starred: false },
];

export default function WatchlistPage() {
    const [items, setItems] = useState(watchlistItems);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const toggleStar = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, starred: !item.starred } : item
        ));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const filteredItems = items.filter(item =>
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Eye size={24} />
                    <div>
                        <h1>Watchlist</h1>
                        <p>Track your favorite assets</p>
                    </div>
                </div>
                <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
                    <Plus size={16} />
                    Add Asset
                </button>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Filter watchlist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles.stats}>
                    <span>{items.length} assets</span>
                    <span className={styles.dot}>•</span>
                    <span>{items.filter(i => i.starred).length} starred</span>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Asset</th>
                            <th>Price</th>
                            <th>24h Change</th>
                            <th>Volume</th>
                            <th>Market Cap</th>
                            <th>Alert</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <button
                                        className={`${styles.starBtn} ${item.starred ? styles.starred : ''}`}
                                        onClick={() => toggleStar(item.id)}
                                    >
                                        <Star size={14} />
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.assetInfo}>
                                        <span className={styles.assetIcon}>{item.symbol.charAt(0)}</span>
                                        <div>
                                            <span className={styles.assetSymbol}>{item.symbol}</span>
                                            <span className={styles.assetName}>{item.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.price}>
                                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td>
                                    <span className={`${styles.change} ${item.change24h >= 0 ? styles.positive : styles.negative}`}>
                                        {item.change24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                                    </span>
                                </td>
                                <td className={styles.volume}>{item.volume}</td>
                                <td className={styles.marketCap}>{item.marketCap}</td>
                                <td>
                                    {item.alert ? (
                                        <span className={styles.alertValue}>
                                            <Bell size={12} />
                                            ${item.alert.toLocaleString()}
                                        </span>
                                    ) : (
                                        <button className={styles.setAlertBtn}>Set Alert</button>
                                    )}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn} title="View Chart">
                                            <BarChart2 size={14} />
                                        </button>
                                        <button className={styles.actionBtn} title="Remove" onClick={() => removeItem(item.id)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add to Watchlist</h3>
                            <button onClick={() => setShowAddModal(false)}><X size={16} /></button>
                        </div>
                        <div className={styles.modalContent}>
                            <input type="text" placeholder="Search for an asset..." />
                            <div className={styles.suggestions}>
                                {['DOGE', 'ADA', 'ATOM', 'UNI', 'AAVE'].map(symbol => (
                                    <button key={symbol} className={styles.suggestionBtn}>
                                        <span className={styles.suggIcon}>{symbol.charAt(0)}</span>
                                        {symbol}
                                        <Plus size={14} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
