import React from 'react';
import styles from './admin-auth.layout.module.css';

interface AdminAuthLayoutProps {
    children: React.ReactNode;
}

export const AdminAuthLayout: React.FC<AdminAuthLayoutProps> = ({ children }) => {
    return (
        <div className={styles.container}>
            {/* Left Side: Branding & Info */}
            <div className={styles.leftPanel}>
                <div className={styles.brand}>
                    <div className={styles.logoSquare}>M</div>
                    <div className={styles.brandText}>
                        <span className={styles.brandTitle}>MERGE</span>
                        <span className={styles.brandSubtitle}>SUPER ADMIN PORTAL</span>
                    </div>
                </div>

                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Control the MERGE<br/>Ecosystem</h1>
                    <p className={styles.heroDesc}>
                        Securely manage platform operations, moderation workflows, AI systems, user safety, and business administration from a centralized control center.
                    </p>

                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.iconBox} style={{ color: '#d8b4fe' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
                                </svg>
                            </div>
                            <h3>Enterprise Security</h3>
                            <p>Advanced administrative controls and secure access protocols.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.iconBox} style={{ color: '#4ade80' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 16V8C21 7.45 20.66 6.96 20.17 6.69L12.58 2.25C12.22 2.04 11.78 2.04 11.42 2.25L3.83 6.69C3.34 6.96 3 7.45 3 8V16C3 16.55 3.34 17.04 3.83 17.31L11.42 21.75C11.78 21.96 12.22 21.96 12.58 21.75L20.17 17.31C20.66 17.04 21 16.55 21 16ZM12 4.15L18.5 7.9L12 11.65L5.5 7.9L12 4.15ZM5 16V9.63L11 13.09V20.53L5 17.07V16ZM13 20.53V13.09L19 9.63V17.07L13 20.53Z"/>
                                </svg>
                            </div>
                            <h3>AI Operations</h3>
                            <p>Manage Lumen algorithms and Scene Partner integrations.</p>
                        </div>
                        <div className={`${styles.featureCard} ${styles.fullWidth}`}>
                            <div className={styles.iconBox} style={{ color: '#fbbf24' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3V21H21V19H5V3H3ZM19 9H15V17H19V9ZM13 13H9V17H13V13ZM7 17V15H11V17H7Z"/>
                                </svg>
                            </div>
                            <div className={styles.fullWidthText}>
                                <h3>Platform Oversight</h3>
                                <p>Monitor user activity, handle moderation reports, and track system health metrics.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footerTextLeft}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    PROTECTED ADMINISTRATIVE ENVIRONMENT
                </div>
            </div>

            {/* Right Side: Form Injection */}
            <div className={styles.rightPanel}>
                <div className={styles.formWrapper}>
                    {children}
                </div>
                <div className={styles.footerTextRight}>
                    AUTHORIZED PERSONNEL ONLY.
                </div>
            </div>
        </div>
    );
};