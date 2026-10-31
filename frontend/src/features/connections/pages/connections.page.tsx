import React from 'react';
import { useTabNavigation } from '../hooks/use-tab-navigation.hook';
import { useActiveConnections } from '../hooks/use-active-connections.hook';
import { usePendingConnections } from '../hooks/use-pending-connections.hook';
import { usePrivateList } from '../hooks/use-private-list.hook';
import { CONNECTIONS_TABS_CONFIG } from '../constants/connections.constants';

const ActiveTabSection: React.FC = () => {
    const { connections, isLoading, total } = useActiveConnections();
    return isLoading ? <p>Loading Active Matches...</p> : <p>Active Matches ({total}): {connections.length} loaded</p>;
};

const PendingTabSection: React.FC = () => {
    const { requests, isLoading, total } = usePendingConnections();
    return isLoading ? <p>Loading Pending Requests...</p> : <p>Pending Requests ({total}): {requests.length} loaded</p>;
};

const ShortlistTabSection: React.FC = () => {
    const { items, isLoading, total } = usePrivateList('SHORTLIST');
    return isLoading ? <p>Loading Shortlist...</p> : <p>Shortlisted Profiles ({total}): {items.length} loaded</p>;
};

const ReviewLaterTabSection: React.FC = () => {
    const { items, isLoading, total } = usePrivateList('REVIEW_LATER');
    return isLoading ? <p>Loading Review Later...</p> : <p>Review Later Profiles ({total}): {items.length} loaded</p>;
};

/**
 * Lightweight structural placeholder for the Connections feature.
 * Consumes the focused tab hooks without heavy styling/CSS.
 */
export const ConnectionsPage: React.FC = () => {
    const { activeTab, setActiveTab, isActive, isPending, isShortlisted, isReviewLater } = useTabNavigation();

    return (
        <div data-testid="connections-page-root">
            <nav role="tablist">
                {CONNECTIONS_TABS_CONFIG.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <main>
                {isActive && <ActiveTabSection />}
                {isPending && <PendingTabSection />}
                {isShortlisted && <ShortlistTabSection />}
                {isReviewLater && <ReviewLaterTabSection />}
            </main>
        </div>
    );
};
