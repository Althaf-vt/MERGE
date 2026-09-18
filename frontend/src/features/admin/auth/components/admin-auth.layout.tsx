import React from 'react';
import styles from './admin-auth.layout.module.css';
import LogoIcon from '../../../../assets/logos/merge-logo-icon.svg';

interface AdminAuthLayoutProps {
    children: React.ReactNode;
}

export const AdminAuthLayout: React.FC<AdminAuthLayoutProps> = ({ children }) => {
    return (
        <div className={styles.layoutContainer}>
            {/* Background Grid Pattern */}
            <div className={styles.gridOverlay}></div>

            {/* Corner Telemetry / Decorative Elements */}
            <div className={styles.topLeft}>
                <img src={LogoIcon} alt="MERGE" className={styles.brandBadge} />
                <div className={styles.brandText}>
                    <span className={styles.brandTitle}>MERGE ADMIN</span>
                    <span className={styles.brandSubtitle}>SYSTEM.CORE.AUTH</span>
                </div>
            </div>

            <div className={styles.topRight}>
                <div className={styles.statusIndicator}>
                    <span className={styles.statusDot}></span>
                    NETWORK SECURE
                </div>
            </div>

            <div className={styles.bottomLeft}>
                <span className={styles.technicalText}>v2.4.0-stable (build 8421)</span>
            </div>

            <div className={styles.bottomRight}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className={styles.technicalText}>RESTRICTED AREA</span>
            </div>

            {/* Centered Auth Card */}
            <div className={styles.authWrapper}>
                {children}
            </div>
        </div>
    );
};