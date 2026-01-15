'use client';

import { ExternalLink, Bell, Clock, TrendingUp } from 'lucide-react';
import styles from './DailyRecap.module.css';

interface RecapItem {
    id: string;
    time: string;
    content: string;
}

const recapItems: RecapItem[] = [
    { id: '1', time: '22 min ago', content: 'A significant cryptocurrency market rally led to over $410 million in short position liquidations within an hour, with Bitcoin surpassing $95,000 and reaching $96,250.' },
    { id: '2', time: '45 min ago', content: 'Ethereum gained momentum above $3,100 with strong network activity and increasing DeFi total value locked.' },
    { id: '3', time: '1h ago', content: 'Solana ecosystem saw a 12% increase in developer activity with three new DeFi protocols launching on mainnet.' },
    { id: '4', time: '2h ago', content: 'XRP trading volume surged 340% following positive regulatory developments in the ongoing SEC case.' },
    { id: '5', time: '3h ago', content: 'Bitcoin ETF inflows reached $750 million, marking the largest single-day inflow in three months.' },
];

export default function DailyRecap() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Daily Recap</h3>
                <div className={styles.actions}>
                    <Bell size={12} />
                    <ExternalLink size={12} />
                </div>
            </div>

            <div className={styles.list}>
                {recapItems.map((item, index) => (
                    <div key={item.id} className={`${styles.item} ${index === 0 ? styles.highlight : ''}`}>
                        <div className={styles.itemHeader}>
                            <TrendingUp size={10} className={styles.trendIcon} />
                            <span className={styles.time}>{item.time}</span>
                        </div>
                        <p className={styles.content}>{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
