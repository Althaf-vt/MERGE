import React, { useState } from 'react';
import { useTabNavigation } from '../hooks/use-tab-navigation.hook';
import { useActiveConnections } from '../hooks/use-active-connections.hook';
import { usePendingConnections } from '../hooks/use-pending-connections.hook';
import { usePrivateList } from '../hooks/use-private-list.hook';
import { ConnectionsTabsHeader } from '../components/connections-tabs-header.component';
import { ConnectionsEmptyState } from '../components/connections-empty-state.component';
import { ConnectionsPagination } from '../components/connections-pagination.component';
import { ConnectionCard } from '../components/connection-card.component';
import { RevokeMatchModal } from '../components/revoke-match-modal.component';
import styles from './connections.module.css';

export const ConnectionsPage: React.FC = () => {
    const { activeTab, setActiveTab, isActive, isPending, isShortlisted, isReviewLater } = useTabNavigation();

    // Data hooks for tab counts and content
    const activeHook = useActiveConnections();
    const pendingHook = usePendingConnections();
    const shortlistHook = usePrivateList('SHORTLIST');
    const reviewLaterHook = usePrivateList('REVIEW_LATER');

    const counts = {
        active: activeHook.total,
        pending: pendingHook.total,
        shortlisted: shortlistHook.total,
        reviewLater: reviewLaterHook.total,
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* Header Section */}
                <header className={styles.headerSection}>
                    <h1 className={styles.pageTitle}>Connections</h1>
                    <p className={styles.pageSubtitle}>
                        Manage your active matches, pending connection requests, and saved profiles.
                    </p>
                </header>

                {/* Tabs Navigation */}
                <ConnectionsTabsHeader
                    activeTab={activeTab}
                    onSelectTab={setActiveTab}
                    counts={counts}
                />

                {/* Main Content Area */}
                <main className={styles.tabContentStage} id={`tabpanel-${activeTab.toLowerCase()}`} role="tabpanel">
                    {isActive && (
                        <ActiveTabSection hook={activeHook} />
                    )}

                    {isPending && (
                        <PendingTabSection hook={pendingHook} />
                    )}

                    {isShortlisted && (
                        <ShortlistTabSection hook={shortlistHook} />
                    )}

                    {isReviewLater && (
                        <ReviewLaterTabSection hook={reviewLaterHook} />
                    )}
                </main>
            </div>
        </div>
    );
};

// 1. Active Matches Tab Section (Wired with ConnectionCard & RevokeMatchModal)
interface ActiveTabSectionProps {
    hook: ReturnType<typeof useActiveConnections>;
}
const ActiveTabSection: React.FC<ActiveTabSectionProps> = ({ hook }) => {
    const [selectedRevoke, setSelectedRevoke] = useState<{ id: string; name: string } | null>(null);

    const handleMessage = (partnerId: string, partnerName: string) => {
        // Reserved for Chat routing when Messaging module is active
        console.log(`Initiating chat conversation with partner: ${partnerName} (${partnerId})`);
    };

    const handleOpenRevoke = (connectionId: string, partnerName: string) => {
        setSelectedRevoke({ id: connectionId, name: partnerName });
    };

    const handleConfirmRevoke = async () => {
        if (!selectedRevoke) return;
        try {
            await hook.revokeMatch(selectedRevoke.id);
            setSelectedRevoke(null);
        } catch (error) {
            console.error('Failed to revoke match:', error);
        }
    };

    if (hook.isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading active matches...</p>
            </div>
        );
    }

    if (hook.connections.length === 0) {
        return <ConnectionsEmptyState tab="ACTIVE" />;
    }

    return (
        <div>
            <div className={styles.cardsGrid}>
                {hook.connections.map((conn) => (
                    <ConnectionCard
                        key={conn.id}
                        connection={conn}
                        onMessage={handleMessage}
                        onRevoke={handleOpenRevoke}
                    />
                ))}
            </div>

            <ConnectionsPagination
                page={hook.page}
                totalPages={hook.totalPages}
                onPageChange={hook.setPage}
                hasNextPage={hook.hasNextPage}
                hasPreviousPage={hook.hasPreviousPage}
            />

            <RevokeMatchModal
                isOpen={Boolean(selectedRevoke)}
                partnerName={selectedRevoke?.name || ''}
                isRevoking={hook.isRevoking}
                onConfirm={handleConfirmRevoke}
                onClose={() => setSelectedRevoke(null)}
            />
        </div>
    );
};

// 2. Pending Tab Layout Shell (Ready for PendingCard & Subfilter in Batch 3)
interface PendingTabSectionProps {
    hook: ReturnType<typeof usePendingConnections>;
}
const PendingTabSection: React.FC<PendingTabSectionProps> = ({ hook }) => {
    if (hook.isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading pending requests...</p>
            </div>
        );
    }

    if (hook.requests.length === 0) {
        return <ConnectionsEmptyState tab="PENDING" />;
    }

    return (
        <div>
            <div className={styles.cardsGrid}>
                {/* Pending Cards & Subfilters will be mounted here in Batch 3 */}
            </div>
            <ConnectionsPagination
                page={hook.page}
                totalPages={hook.totalPages}
                onPageChange={hook.setPage}
                hasNextPage={hook.hasNextPage}
                hasPreviousPage={hook.hasPreviousPage}
            />
        </div>
    );
};

// 3. Shortlist Tab Layout Shell (Ready for PrivateListCard in Batch 4)
interface ShortlistTabSectionProps {
    hook: ReturnType<typeof usePrivateList>;
}
const ShortlistTabSection: React.FC<ShortlistTabSectionProps> = ({ hook }) => {
    if (hook.isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading shortlisted profiles...</p>
            </div>
        );
    }

    if (hook.items.length === 0) {
        return <ConnectionsEmptyState tab="SHORTLISTED" />;
    }

    return (
        <div>
            <div className={styles.cardsGrid}>
                {/* Shortlist Cards will be mounted here in Batch 4 */}
            </div>
            <ConnectionsPagination
                page={hook.page}
                totalPages={hook.totalPages}
                onPageChange={hook.setPage}
                hasNextPage={hook.hasNextPage}
                hasPreviousPage={hook.hasPreviousPage}
            />
        </div>
    );
};

// 4. Review Later Tab Layout Shell (Ready for PrivateListCard in Batch 4)
interface ReviewLaterTabSectionProps {
    hook: ReturnType<typeof usePrivateList>;
}
const ReviewLaterTabSection: React.FC<ReviewLaterTabSectionProps> = ({ hook }) => {
    if (hook.isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading profiles to review later...</p>
            </div>
        );
    }

    if (hook.items.length === 0) {
        return <ConnectionsEmptyState tab="REVIEW_LATER" />;
    }

    return (
        <div>
            <div className={styles.cardsGrid}>
                {/* Review Later Cards will be mounted here in Batch 4 */}
            </div>
            <ConnectionsPagination
                page={hook.page}
                totalPages={hook.totalPages}
                onPageChange={hook.setPage}
                hasNextPage={hook.hasNextPage}
                hasPreviousPage={hook.hasPreviousPage}
            />
        </div>
    );
};
