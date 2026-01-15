'use client';

import { Bell, Search, User, ChevronDown } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <div className={styles.greeting}>
                    <h1>Welcome back, Trader</h1>
                    <p>{currentDate}</p>
                </div>
            </div>

            <div className={styles.center}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search assets, predictions, or ask AI..."
                        className={styles.searchInput}
                    />
                    <kbd className={styles.kbd}>⌘K</kbd>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.marketStatus}>
                    <span className={styles.statusIndicator}></span>
                    <span>Markets Open</span>
                </div>

                <button className={styles.iconBtn}>
                    <Bell size={20} />
                    <span className={styles.notificationDot}></span>
                </button>

                <div className={styles.profile}>
                    <div className={styles.avatar}>
                        <User size={20} />
                    </div>
                    <ChevronDown size={16} />
                </div>
            </div>
        </header>
    );
}
