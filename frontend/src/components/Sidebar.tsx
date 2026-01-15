'use client';

import {
    Home,
    FileText,
    Database,
    Bot,
    TrendingUp,
    Newspaper,
    Lightbulb,
    DollarSign,
    Eye,
    MoreHorizontal,
    Settings
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { PageType } from '@/app/page';

interface SidebarProps {
    activePage: PageType;
    setActivePage: (page: PageType) => void;
}

const navItems: { icon: any; label: string; page: PageType; badge?: string }[] = [
    { icon: Home, label: 'Home', page: 'home' },
    { icon: FileText, label: 'Research', page: 'research' },
    { icon: Database, label: 'Datasets', page: 'datasets', badge: 'NEW' },
    { icon: Bot, label: 'CryptAI', page: 'cryptai' },
    { icon: TrendingUp, label: 'Signals', page: 'signals' },
    { icon: Newspaper, label: 'News', page: 'news' },
    { icon: Eye, label: 'Watchlists', page: 'watchlist' },
];

export default function Sidebar({ activePage, setActivePage }: SidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>⚡</div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <button
                        key={item.page}
                        className={`${styles.navItem} ${activePage === item.page ? styles.active : ''}`}
                        onClick={() => setActivePage(item.page)}
                        title={item.label}
                    >
                        <item.icon size={18} strokeWidth={1.5} />
                        {item.badge && <span className={styles.badge}>{item.badge}</span>}
                    </button>
                ))}
            </nav>

            <div className={styles.footer}>
                <button className={styles.navItem} title="More">
                    <MoreHorizontal size={18} strokeWidth={1.5} />
                </button>
                <button
                    className={`${styles.navItem} ${activePage === 'settings' ? styles.active : ''}`}
                    onClick={() => setActivePage('settings')}
                    title="Settings"
                >
                    <Settings size={18} strokeWidth={1.5} />
                </button>
            </div>
        </aside>
    );
}
