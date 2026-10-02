import React, { useState, useEffect } from 'react';
import { useGetBlockedUsersQuery, useUnblockUserMutation } from '../api/profile.api';
import { SecurityConfirmationModal } from '../components/security-confirmation-modal.component';
import styles from './blocked-users.module.css';

export const BlockedUsersPage: React.FC = () => {
    // UI State
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<'RECENT' | 'OLDEST'>('RECENT');
    
    // Modal State
    const [unblockTarget, setUnblockTarget] = useState<{ id: string, name: string } | null>(null);

    // RTK Query hooks
    const { data: response, isLoading, isFetching } = useGetBlockedUsersQuery({ search: debouncedSearch, sortBy });
    const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();

    const blockedUsers = response?.data || [];

    // Debounce the search input by 500ms to prevent spamming the database
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchInput]);

    const handleUnblockConfirm = async () => {
        if (!unblockTarget) return;
        try {
            await unblockUser(unblockTarget.id).unwrap();
            setUnblockTarget(null);
            // Optional: Dispatch a global success toast here
        } catch (error) {
            console.error('Failed to unblock user:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatReason = (enumReason: string) => {
        return enumReason.replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Blocked Users</h1>
                <p className={styles.subtitle}>Manage profiles you've blocked from interacting with you.</p>
            </header>

            {/* Info Card[cite: 10] */}
            <div className={styles.infoCard}>
                <div className={styles.infoIconWrap}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div className={styles.infoContent}>
                    <h3>About Blocked Users</h3>
                    <ul className={styles.infoList}>
                        <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                            Blocked users cannot view your profile or send messages.
                        </li>
                        <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                            Blocking is discreet; they are not notified.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Controls Bar[cite: 10] */}
            <div className={styles.controlsRow}>
                <div className={styles.countBadge}>
                    Blocked Profiles: {blockedUsers.length}
                </div>
                
                <div className={styles.filtersWrap}>
                    <div className={styles.searchBox}>
                        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input 
                            type="text" 
                            className={styles.searchInput} 
                            placeholder="Search blocked users..." 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    <select 
                        className={styles.sortSelect}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'RECENT' | 'OLDEST')}
                    >
                        <option value="RECENT">Recently Blocked</option>
                        <option value="OLDEST">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className={styles.userList}>
                {isLoading ? (
                    <div className={styles.emptyState}>Loading blocked profiles...</div>
                ) : blockedUsers.length === 0 ? (
                    <div className={styles.emptyState}>
                        {searchInput ? 'No blocked users match your search.' : 'You have no blocked profiles.'}
                    </div>
                ) : (
                    blockedUsers.map((user) => (
                        <div key={user.blockedId} className={`${styles.userCard} ${user.isDeleted ? styles.deleted : ''}`}>
                            <div className={styles.userInfoWrap}>
                                {user.avatarUrl && !user.isDeleted ? (
                                    <img src={user.avatarUrl} alt={user.displayName} className={styles.avatar} />
                                ) : (
                                    <div className={`${styles.avatar} ${styles.avatarDeleted}`}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                                    </div>
                                )}
                                
                                <div className={styles.userDetails}>
                                    <div className={styles.userNameRow}>
                                        <h4 className={`${styles.userName} ${user.isDeleted ? styles.deletedName : ''}`}>
                                            {user.displayName}
                                        </h4>
                                        
                                        {!user.isDeleted && (user.genderIdentity || user.customLabel) && (
                                            <div className={styles.pillWrap}>
                                                {user.genderIdentity && <span className={styles.badgePill}>{user.genderIdentity}</span>}
                                                {user.customLabel && <span className={styles.badgePill}>{user.customLabel}</span>}
                                            </div>
                                        )}

                                        {user.isDeleted && (
                                            <span className={`${styles.badgePill} ${styles.badgeGray}`}>Identity: Unknown</span>
                                        )}
                                    </div>

                                    {!user.isDeleted && user.location && (
                                        <div className={styles.locationText}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                            {user.location}
                                        </div>
                                    )}

                                    <div className={styles.metaRow}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                        Blocked on {formatDate(user.blockedAt)}
                                        <span className={styles.reasonText}>• Reason: {formatReason(user.reason)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.actionWrap}>
                                <button className={styles.btnOutline} disabled={user.isDeleted}>
                                    {user.isDeleted ? 'Unavailable' : 'View Profile'}
                                </button>
                                <button 
                                    className={styles.btnPrimary}
                                    onClick={() => setUnblockTarget({ id: user.blockedId, name: user.displayName })}
                                    disabled={isUnblocking}
                                >
                                    Unblock
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {!isLoading && blockedUsers.length > 0 && (
                    <div className={styles.endOfList}>
                        {isFetching ? 'Refreshing...' : 'End of list'}
                    </div>
                )}
            </div>

            {/* Reusable Security Confirmation Modal for Unblocking */}
            <SecurityConfirmationModal
                isOpen={!!unblockTarget}
                title="Unblock User"
                message={`Are you sure you want to unblock ${unblockTarget?.name}? They will be able to view your profile and send you messages again.`}
                confirmText="Yes, Unblock"
                isLoading={isUnblocking}
                onClose={() => setUnblockTarget(null)}
                onConfirm={handleUnblockConfirm}
            />
        </div>
    );
};