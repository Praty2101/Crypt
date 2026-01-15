'use client';

import PricesChart from '@/components/PricesChart';
import MarketOverview from '@/components/MarketOverview';
import NewsFeed from '@/components/NewsFeed';
import DailyRecap from '@/components/DailyRecap';
import Research from '@/components/Research';
import Mindshare from '@/components/Mindshare';
import styles from './HomePage.module.css';

export default function HomePage() {
    return (
        <div className={styles.container}>
            <div className={styles.leftSection}>
                <PricesChart />
                <div className={styles.bottomSection}>
                    <div className={styles.bottomPanel}>
                        <DailyRecap />
                    </div>
                    <div className={styles.bottomPanel}>
                        <Research />
                    </div>
                    <div className={styles.bottomPanel}>
                        <Mindshare />
                    </div>
                </div>
            </div>
            <div className={styles.rightSection}>
                <MarketOverview />
                <NewsFeed />
            </div>
        </div>
    );
}
