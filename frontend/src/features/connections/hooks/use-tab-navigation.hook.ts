import { useState, useCallback } from 'react';
import type { ConnectionsTab } from '../../../shared/types/connections.types';

export const useTabNavigation = (initialTab: ConnectionsTab = 'ACTIVE') => {
    const [activeTab, setActiveTabState] = useState<ConnectionsTab>(initialTab);

    const setActiveTab = useCallback((tab: ConnectionsTab) => {
        setActiveTabState(tab);
    }, []);

    return {
        activeTab,
        setActiveTab,
        isActive: activeTab === 'ACTIVE',
        isPending: activeTab === 'PENDING',
        isShortlisted: activeTab === 'SHORTLISTED',
        isReviewLater: activeTab === 'REVIEW_LATER',
    };
};

