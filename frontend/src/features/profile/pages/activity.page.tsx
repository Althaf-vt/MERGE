import React from 'react';
import styles from './activity.module.css';

export const ActivityPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Activity</h1>
                <p className={styles.subtitle}>Track your recent matchmaking activity.</p>
            </header>

            <div className={styles.layoutGrid}>
                {/* Main Content Area */}
                <div className={styles.mainColumn}>
                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.iconWrap}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            </div>
                            <div>
                                <h3 className={styles.statValue}>34</h3>
                                <p className={styles.statLabel}>Interests Sent</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.iconWrap}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            </div>
                            <div>
                                <h3 className={styles.statValue}>18</h3>
                                <p className={styles.statLabel}>Interests Received</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.iconWrap}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </div>
                            <div>
                                <h3 className={styles.statValue}>7</h3>
                                <p className={styles.statLabel}>Matches</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.iconWrap}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </div>
                            <div>
                                <h3 className={styles.statValue}>142</h3>
                                <p className={styles.statLabel}>Profile Views</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className={styles.timelineCard}>
                        <h2 className={styles.cardTitle}>Recent Timeline</h2>
                        <div className={styles.timelineList}>
                            <div className={styles.timelineItem}>
                                <div className={`${styles.timelineDot} ${styles.timelineDotActive}`}></div>
                                <p className={styles.timelineText}>You received an interest from <span className={styles.highlightText}>Alex</span></p>
                                <p className={styles.timelineTime}>2H AGO</p>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot}></div>
                                <p className={styles.timelineText}>You matched with Rahul</p>
                                <p className={styles.timelineTime}>YESTERDAY</p>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot}></div>
                                <p className={styles.timelineText}>You shortlisted David</p>
                                <p className={styles.timelineTime}>2D AGO</p>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot}></div>
                                <p className={styles.timelineText}>Your profile was viewed 12 times</p>
                                <p className={styles.timelineTime}>3D AGO</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className={styles.sidebarColumn}>
                    {/* Recent Matches */}
                    <div className={styles.sideSection}>
                        <div className={styles.sideHeader}>
                            <h3 className={styles.sideTitle}>Recent Matches</h3>
                            <button className={styles.seeAllBtn}>SEE ALL</button>
                        </div>
                        <div className={styles.sideCard}>
                            <div className={styles.sideProfile}>
                                {/* Using a placeholder div to represent the photo layout */}
                                <div className={`${styles.sideAvatar} ${styles.avatarPlaceholder}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                </div>
                                <div className={styles.sideInfo}>
                                    <p className={styles.sideName}>Rahul, 31</p>
                                    <p className={styles.sideMatch}>92% Match</p>
                                </div>
                            </div>
                            <button className={styles.arrowBtn}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                        </div>
                    </div>

                    {/* Shortlisted */}
                    <div className={styles.sideSection}>
                        <div className={styles.sideHeader}>
                            <h3 className={styles.sideTitle}>Shortlisted</h3>
                        </div>
                        <div className={styles.sideCard}>
                            <div className={styles.sideProfile}>
                                <div className={`${styles.sideAvatar} ${styles.avatarPlaceholder}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                </div>
                                <div className={styles.sideInfo}>
                                    <p className={styles.sideName}>David, 34</p>
                                    <p className={styles.sideCompat}>88% Compatibility</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Review Later */}
                    <div className={styles.sideSection}>
                        <div className={styles.sideHeader}>
                            <h3 className={styles.sideTitle}>Review Later</h3>
                        </div>
                        <div className={styles.sideCard}>
                            <div className={styles.sideProfile}>
                                <div className={`${styles.sideAvatar} ${styles.avatarPlaceholder}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <div className={styles.sideInfo}>
                                    <p className={styles.sideName}>Samantha, 29</p>
                                    <p className={styles.sideCompat}>85% Compatibility</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};