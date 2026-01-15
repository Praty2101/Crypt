'use client';

import { useState } from 'react';
import { Settings, Bell, Moon, Sun, Globe, Lock, User, Palette, Shield, Database, Mail, Trash2 } from 'lucide-react';
import styles from './SettingsPage.module.css';

interface SettingSection {
    id: string;
    title: string;
    icon: any;
}

const sections: SettingSection[] = [
    { id: 'profile', title: 'Profile', icon: User },
    { id: 'appearance', title: 'Appearance', icon: Palette },
    { id: 'notifications', title: 'Notifications', icon: Bell },
    { id: 'privacy', title: 'Privacy & Security', icon: Shield },
    { id: 'data', title: 'Data & API', icon: Database },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('profile');
    const [settings, setSettings] = useState({
        darkMode: true,
        notifications: {
            priceAlerts: true,
            newsUpdates: true,
            signalAlerts: true,
            portfolioChanges: false,
            weeklyDigest: true,
        },
        privacy: {
            showPortfolio: false,
            shareAnalytics: true,
        },
        currency: 'USD',
        timezone: 'UTC',
    });

    const toggleSetting = (category: string, key: string) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...(prev as any)[category],
                [key]: !(prev as any)[category][key],
            }
        }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <h2>Settings</h2>
                <nav className={styles.nav}>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            className={`${styles.navItem} ${activeSection === section.id ? styles.active : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <section.icon size={18} />
                            {section.title}
                        </button>
                    ))}
                </nav>
            </div>

            <div className={styles.content}>
                {activeSection === 'profile' && (
                    <div className={styles.section}>
                        <h3>Profile Settings</h3>
                        <p className={styles.sectionDesc}>Manage your account information</p>

                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            <input type="text" placeholder="Your name" defaultValue="Trader" />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input type="email" placeholder="your@email.com" />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Timezone</label>
                            <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
                                <option value="UTC">UTC</option>
                                <option value="EST">Eastern Time (EST)</option>
                                <option value="PST">Pacific Time (PST)</option>
                                <option value="IST">India Standard Time (IST)</option>
                            </select>
                        </div>

                        <button className={styles.saveBtn}>Save Changes</button>
                    </div>
                )}

                {activeSection === 'appearance' && (
                    <div className={styles.section}>
                        <h3>Appearance</h3>
                        <p className={styles.sectionDesc}>Customize how Crypt looks</p>

                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <Moon size={18} />
                                <div>
                                    <span className={styles.settingLabel}>Dark Mode</span>
                                    <span className={styles.settingDesc}>Use dark theme across the app</span>
                                </div>
                            </div>
                            <button
                                className={`${styles.toggle} ${settings.darkMode ? styles.on : ''}`}
                                onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                            >
                                <span className={styles.toggleThumb}></span>
                            </button>
                        </div>

                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <Globe size={18} />
                                <div>
                                    <span className={styles.settingLabel}>Currency</span>
                                    <span className={styles.settingDesc}>Display prices in your preferred currency</span>
                                </div>
                            </div>
                            <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeSection === 'notifications' && (
                    <div className={styles.section}>
                        <h3>Notifications</h3>
                        <p className={styles.sectionDesc}>Configure your notification preferences</p>

                        {Object.entries(settings.notifications).map(([key, value]) => (
                            <div key={key} className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <Bell size={18} />
                                    <div>
                                        <span className={styles.settingLabel}>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className={`${styles.toggle} ${value ? styles.on : ''}`}
                                    onClick={() => toggleSetting('notifications', key)}
                                >
                                    <span className={styles.toggleThumb}></span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeSection === 'privacy' && (
                    <div className={styles.section}>
                        <h3>Privacy & Security</h3>
                        <p className={styles.sectionDesc}>Control your privacy settings</p>

                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <Lock size={18} />
                                <div>
                                    <span className={styles.settingLabel}>Show Portfolio Value</span>
                                    <span className={styles.settingDesc}>Display your total portfolio value</span>
                                </div>
                            </div>
                            <button
                                className={`${styles.toggle} ${settings.privacy.showPortfolio ? styles.on : ''}`}
                                onClick={() => toggleSetting('privacy', 'showPortfolio')}
                            >
                                <span className={styles.toggleThumb}></span>
                            </button>
                        </div>

                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <Database size={18} />
                                <div>
                                    <span className={styles.settingLabel}>Share Analytics</span>
                                    <span className={styles.settingDesc}>Help improve Crypt with anonymous usage data</span>
                                </div>
                            </div>
                            <button
                                className={`${styles.toggle} ${settings.privacy.shareAnalytics ? styles.on : ''}`}
                                onClick={() => toggleSetting('privacy', 'shareAnalytics')}
                            >
                                <span className={styles.toggleThumb}></span>
                            </button>
                        </div>

                        <div className={styles.dangerZone}>
                            <h4>Danger Zone</h4>
                            <button className={styles.dangerBtn}>
                                <Trash2 size={14} />
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}

                {activeSection === 'data' && (
                    <div className={styles.section}>
                        <h3>Data & API</h3>
                        <p className={styles.sectionDesc}>Manage your API keys and data exports</p>

                        <div className={styles.apiSection}>
                            <h4>API Keys</h4>
                            <p>Generate API keys to access Crypt data programmatically.</p>
                            <button className={styles.generateBtn}>Generate API Key</button>
                        </div>

                        <div className={styles.apiSection}>
                            <h4>Export Data</h4>
                            <p>Download your portfolio data and transaction history.</p>
                            <div className={styles.exportBtns}>
                                <button>Export Portfolio (CSV)</button>
                                <button>Export Transactions (CSV)</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
