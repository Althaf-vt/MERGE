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
import { PendingSubfilter } from '../components/pending-subfilter.component';
import { PendingCard } from '../components/pending-card.component';
import { PrivateListCard } from '../components/private-list-card.component';
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

// 1. Active Matches Tab Section
interface ActiveTabSectionProps {
    hook: ReturnType<typeof useActiveConnections>;
}
const ActiveTabSection: React.FC<ActiveTabSectionProps> = ({ hook }) => {
    const [selectedRevoke, setSelectedRevoke] = useState<{ id: string; name: string } | null>(null);

    const handleMessage = (partnerId: string, partnerName: string) => {
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

// 2. Pending Requests Tab Section
interface PendingTabSectionProps {
    hook: ReturnType<typeof usePendingConnections>;
}
const PendingTabSection: React.FC<PendingTabSectionProps> = ({ hook }) => {
    const [activeActionId, setActiveActionId] = useState<string | null>(null);

    const handleAccept = async (connectionId: string) => {
        setActiveActionId(connectionId);
        try {
            await hook.actions.accept(connectionId);
        } catch (err) {
            console.error('Failed to accept request:', err);
        } finally {
            setActiveActionId(null);
        }
    };

    const handleDecline = async (connectionId: string) => {
        setActiveActionId(connectionId);
        try {
            await hook.actions.decline(connectionId);
        } catch (err) {
            console.error('Failed to decline request:', err);
        } finally {
            setActiveActionId(null);
        }
    };

    const handleCancel = async (connectionId: string) => {
        setActiveActionId(connectionId);
        try {
            await hook.actions.cancel(connectionId);
        } catch (err) {
            console.error('Failed to cancel request:', err);
        } finally {
            setActiveActionId(null);
        }
    };

    const getEmptyStateContent = () => {
        if (hook.filter === 'RECEIVED') {
            return {
                title: 'No Received Requests',
                description: 'You have responded to all incoming requests. When another member expresses interest, they will appear here.',
            };
        }
        if (hook.filter === 'SENT') {
            return {
                title: 'No Outbound Requests',
                description: 'You haven\'t sent any requests that are pending. Browse Discovery to find someone interesting and reach out.',
            };
        }
        return undefined;
    };

    const customEmpty = getEmptyStateContent();

    return (
        <div>
            <PendingSubfilter
                currentFilter={hook.filter}
                onFilterChange={hook.setFilter}
            />

            {hook.isLoading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <p>Loading pending requests...</p>
                </div>
            ) : hook.requests.length === 0 ? (
                <ConnectionsEmptyState
                    tab="PENDING"
                    customTitle={customEmpty?.title}
                    customDescription={customEmpty?.description}
                />
            ) : (
                <>
                    <div className={styles.cardsGrid}>
                        {hook.requests.map((request) => (
                            <PendingCard
                                key={request.id}
                                request={request}
                                onAccept={handleAccept}
                                onDecline={handleDecline}
                                onCancel={handleCancel}
                                isAccepting={activeActionId === request.id && hook.actionLoading.isAccepting}
                                isDeclining={activeActionId === request.id && hook.actionLoading.isDeclining}
                                isCancelling={activeActionId === request.id && hook.actionLoading.isCancelling}
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
                </>
            )}
        </div>
    );
};

// 3. Shortlisted Profiles Tab Section
interface ShortlistTabSectionProps {
    hook: ReturnType<typeof usePrivateList>;
}
const ShortlistTabSection: React.FC<ShortlistTabSectionProps> = ({ hook }) => {
    const [actionState, setActionState] = useState<{ id: string; type: 'CONNECT' | 'MOVE' | 'REMOVE' } | null>(null);

    const handleConnect = async (targetUserId: string) => {
        setActionState({ id: targetUserId, type: 'CONNECT' });
        try {
            await hook.actions.sendRequest(targetUserId);
        } catch (err) {
            console.error('Failed to send connection request:', err);
        } finally {
            setActionState(null);
        }
    };

    const handleMove = async (targetUserId: string, targetType: 'SHORTLIST' | 'REVIEW_LATER') => {
        setActionState({ id: targetUserId, type: 'MOVE' });
        try {
            await hook.actions.move(targetUserId, targetType);
        } catch (err) {
            console.error('Failed to move profile:', err);
        } finally {
            setActionState(null);
        }
    };

    const handleRemove = async (targetUserId: string) => {
        setActionState({ id: targetUserId, type: 'REMOVE' });
        try {
            await hook.actions.remove(targetUserId);
        } catch (err) {
            console.error('Failed to remove profile from shortlist:', err);
        } finally {
            setActionState(null);
        }
    };

    const handlePriorityIntro = (targetUserId: string, targetName: string) => {
        console.log(`Opening priority intro modal for: ${targetName} (${targetUserId})`);
    };

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
                {hook.items.map((item) => (
                    <PrivateListCard
                        key={item.id}
                        item={item}
                        onConnect={handleConnect}
                        onPriorityIntro={handlePriorityIntro}
                        onMove={handleMove}
                        onRemove={handleRemove}
                        isConnecting={actionState?.id === item.targetUserId && actionState?.type === 'CONNECT' && hook.actionLoading.isSendingRequest}
                        isMoving={actionState?.id === item.targetUserId && actionState?.type === 'MOVE' && hook.actionLoading.isAdding}
                        isRemoving={actionState?.id === item.targetUserId && actionState?.type === 'REMOVE' && hook.actionLoading.isRemoving}
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
        </div>
    );
};

// 4. Review Later Tab Section
interface ReviewLaterTabSectionProps {
    hook: ReturnType<typeof usePrivateList>;
}
const ReviewLaterTabSection: React.FC<ReviewLaterTabSectionProps> = ({ hook }) => {
    const [actionState, setActionState] = useState<{ id: string; type: 'CONNECT' | 'MOVE' | 'REMOVE' } | null>(null);

    const handleConnect = async (targetUserId: string) => {
        setActionState({ id: targetUserId, type: 'CONNECT' });
        try {
            await hook.actions.sendRequest(targetUserId);
        } catch (err) {
            console.error('Failed to send connection request:', err);
        } finally {
            setActionState(null);
        }
    };

    const handleMove = async (targetUserId: string, targetType: 'SHORTLIST' | 'REVIEW_LATER') => {
        setActionState({ id: targetUserId, type: 'MOVE' });
        try {
            await hook.actions.move(targetUserId, targetType);
        } catch (err) {
            console.error('Failed to move profile:', err);
        } finally {
            setActionState(null);
        }
    };

    const handleRemove = async (targetUserId: string) => {
        setActionState({ id: targetUserId, type: 'REMOVE' });
        try {
            await hook.actions.remove(targetUserId);
        } catch (err) {
            console.error('Failed to remove profile from review later:', err);
        } finally {
            setActionState(null);
        }
    };

    const handlePriorityIntro = (targetUserId: string, targetName: string) => {
        console.log(`Opening priority intro modal for: ${targetName} (${targetUserId})`);
    };

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
                {hook.items.map((item) => (
                    <PrivateListCard
                        key={item.id}
                        item={item}
                        onConnect={handleConnect}
                        onPriorityIntro={handlePriorityIntro}
                        onMove={handleMove}
                        onRemove={handleRemove}
                        isConnecting={actionState?.id === item.targetUserId && actionState?.type === 'CONNECT' && hook.actionLoading.isSendingRequest}
                        isMoving={actionState?.id === item.targetUserId && actionState?.type === 'MOVE' && hook.actionLoading.isAdding}
                        isRemoving={actionState?.id === item.targetUserId && actionState?.type === 'REMOVE' && hook.actionLoading.isRemoving}
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
        </div>
    );
};
