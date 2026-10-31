import React from 'react';
import type { ConnectionsTab } from '../types/connections.types';
import { CONNECTIONS_TABS_CONFIG } from '../constants/connections.constants';
import styles from './connections-tabs-header.module.css';

export interface TabCounts {
    active?: number;
    pending?: number;
    shortlisted?: number;
    reviewLater?: number;
}

export interface ConnectionsTabsHeaderProps {
    activeTab: ConnectionsTab;
    onSelectTab: (tab: ConnectionsTab) => void;
    counts?: TabCounts;
}

export const ConnectionsTabsHeader: React.FC<ConnectionsTabsHeaderProps> = ({
    activeTab,
    onSelectTab,
    counts,
}) => {
    const getTabCount = (tabKey: ConnectionsTab): number | undefined => {
        if (!counts) return undefined;
        switch (tabKey) {
            case 'ACTIVE':
                return counts.active;
            case 'PENDING':
                return counts.pending;
            case 'SHORTLISTED':
                return counts.shortlisted;
            case 'REVIEW_LATER':
                return counts.reviewLater;
            default:
                return undefined;
        }
    };

    return (
        <nav className={styles.tabsNav} role="tablist" aria-label="Connection tabs">
            <div className={styles.tabsList}>
                {CONNECTIONS_TABS_CONFIG.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const count = getTabCount(tab.key);

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`tabpanel-${tab.key.toLowerCase()}`}
                            id={`tab-${tab.key.toLowerCase()}`}
                            tabIndex={isActive ? 0 : -1}
                            className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
                            onClick={() => onSelectTab(tab.key)}
                        >
                            <span className={styles.tabLabel}>{tab.label}</span>
                            {typeof count === 'number' && (
                                <span className={`${styles.badge} ${isActive ? styles.badgeActive : ''}`}>
                                    {count}
                                </span>
                            )}
                            {isActive && <div className={styles.activeIndicator} layout-id="activeIndicator" />}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

