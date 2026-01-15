'use client';

import { ExternalLink, Plus, ArrowRight } from 'lucide-react';
import styles from './Research.module.css';

const reports = [
    { id: '1', emoji: '📊', title: 'Stellar Financial Ecosystem Update', author: 'Matt Kreiser' },
    { id: '2', emoji: '💰', title: 'Pyth: Pricing the World and Capturing the Value', author: 'Whynohen' },
    { id: '3', emoji: '🔗', title: 'Stable: Mainnet and Token Generation Event', author: 'Shale Ferdana' },
];

export default function Research() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Research</h3>
                <ExternalLink size={12} className={styles.icon} />
            </div>

            <div className={styles.list}>
                {reports.map((report) => (
                    <article key={report.id} className={styles.item}>
                        <div className={styles.thumb}>{report.emoji}</div>
                        <div className={styles.itemContent}>
                            <h4 className={styles.itemTitle}>{report.title}</h4>
                            <span className={styles.author}>{report.author}</span>
                        </div>
                    </article>
                ))}

                <button className={styles.createBtn}>
                    <Plus size={12} />
                    <span>Create Your Own Report</span>
                    <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
}
