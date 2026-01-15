'use client';

import { useState } from 'react';
import { Search, Sparkles, Moon, Sun, Settings, Bell, User, X } from 'lucide-react';
import styles from './TopBar.module.css';
import { PageType } from '@/app/page';

interface TopBarProps {
    onCryptAIClick: () => void;
    setActivePage: (page: PageType) => void;
}

export default function TopBar({ onCryptAIClick, setActivePage }: TopBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            alert(`Searching for: ${searchQuery}`);
        }
    };

    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
                <span className={styles.brand} onClick={() => setActivePage('home')}>Crypt</span>
                <div className={styles.announcement}>
                    <span>The 2026 Annual Thesis is out -</span>
                    <a href="#" className={styles.announcementLink} onClick={(e) => {
                        e.preventDefault();
                        setActivePage('research');
                    }}>Get Early Access →</a>
                </div>
            </div>

            <div className={styles.center}>
                <form className={styles.searchBox} onSubmit={handleSearch}>
                    <Search size={14} strokeWidth={1.5} />
                    <input
                        type="text"
                        placeholder="Search assets, news, research..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <X size={12} className={styles.clearSearch} onClick={() => setSearchQuery('')} />
                    )}
                    <span className={styles.searchShortcut}>/</span>
                </form>
                <button className={styles.cryptaiBtn} onClick={onCryptAIClick}>
                    <Sparkles size={13} />
                    <span>Ask CryptAI</span>
                </button>
            </div>

            <div className={styles.right}>
                <button
                    className={styles.iconBtn}
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="Notifications"
                >
                    <Bell size={16} strokeWidth={1.5} />
                    <span className={styles.notifDot}></span>
                </button>
                <button
                    className={styles.iconBtn}
                    onClick={() => setDarkMode(!darkMode)}
                    title={darkMode ? 'Light Mode' : 'Dark Mode'}
                >
                    {darkMode ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                </button>
                <button
                    className={styles.iconBtn}
                    onClick={() => setActivePage('settings')}
                    title="Settings"
                >
                    <Settings size={16} strokeWidth={1.5} />
                </button>
                <button className={styles.textBtn}>Log In</button>
                <button className={styles.upgradeBtn}>Upgrade</button>
            </div>

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <span>Notifications</span>
                        <button onClick={() => setShowNotifications(false)}><X size={14} /></button>
                    </div>
                    <div className={styles.dropdownContent}>
                        <div className={styles.notifItem}>
                            <span className={styles.notifDotSmall}></span>
                            <div>
                                <p>BTC just crossed $95,000</p>
                                <span>2 min ago</span>
                            </div>
                        </div>
                        <div className={styles.notifItem}>
                            <span className={styles.notifDotSmall}></span>
                            <div>
                                <p>New research report available</p>
                                <span>15 min ago</span>
                            </div>
                        </div>
                        <div className={styles.notifItem}>
                            <div>
                                <p>ETH Signal: Bullish breakout</p>
                                <span>1 hour ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
