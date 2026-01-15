'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import HomePage from '@/components/pages/HomePage';
import ResearchPage from '@/components/pages/ResearchPage';
import DatasetsPage from '@/components/pages/DatasetsPage';
import CryptAIPage from '@/components/pages/CryptAIPage';
import SignalsPage from '@/components/pages/SignalsPage';
import NewsPage from '@/components/pages/NewsPage';
import WatchlistPage from '@/components/pages/WatchlistPage';
import SettingsPage from '@/components/pages/SettingsPage';
import styles from './page.module.css';

export type PageType = 'home' | 'research' | 'datasets' | 'cryptai' | 'signals' | 'news' | 'watchlist' | 'settings';

export default function App() {
    const [activePage, setActivePage] = useState<PageType>('home');
    const [showCryptAI, setShowCryptAI] = useState(false);

    const renderPage = () => {
        switch (activePage) {
            case 'home':
                return <HomePage />;
            case 'research':
                return <ResearchPage />;
            case 'datasets':
                return <DatasetsPage />;
            case 'cryptai':
                return <CryptAIPage />;
            case 'signals':
                return <SignalsPage />;
            case 'news':
                return <NewsPage />;
            case 'watchlist':
                return <WatchlistPage />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <HomePage />;
        }
    };

    return (
        <div className={styles.layout}>
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <main className={styles.main}>
                <TopBar
                    onCryptAIClick={() => setShowCryptAI(true)}
                    setActivePage={setActivePage}
                />
                <div className={styles.content}>
                    {renderPage()}
                </div>
            </main>

            {/* CryptAI Modal */}
            {showCryptAI && (
                <div className={styles.modalOverlay} onClick={() => setShowCryptAI(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <CryptAIPage isModal onClose={() => setShowCryptAI(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
