import React, { useState } from 'react';
import styles from './admin-users.module.css';
import { useGetUsersQuery } from '../api/admin-users.api';
import type { AdminUserStatus } from '../types/admin-users.types';
import { UserActionModal } from '../components/user-action-modal.component';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import { AnimatePresence } from 'motion/react';

export const AdminUsersPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<AdminUserStatus | ''>('');
    
    // Modal State
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        type: 'SUSPEND' | 'UNSUSPEND' | 'BAN' | 'UNBAN';
        userId: string;
        userEmail: string;
    }>({ isOpen: false, type: 'SUSPEND', userId: '', userEmail: '' });

    const { data, isLoading, isFetching } = useGetUsersQuery({
        page,
        limit: 15,
        search: search.length > 2 ? search : undefined,
        status: statusFilter === '' ? undefined : statusFilter,
    });

    const getStatusBadge = (status: AdminUserStatus) => {
        switch (status) {
            case 'ACTIVE': return <span className={`${styles.badge} ${styles.badgeActive}`}>ACTIVE</span>;
            case 'SUSPENDED': return <span className={`${styles.badge} ${styles.badgeSuspended}`}>SUSPENDED</span>;
            case 'BANNED': return <span className={`${styles.badge} ${styles.badgeBanned}`}>BANNED</span>;
            case 'DELETED': return <span className={`${styles.badge} ${styles.badgeDeleted}`}>DELETED</span>;
            default: return null;
        }
    };

    const handleActionClick = (type: 'SUSPEND' | 'UNSUSPEND' | 'BAN' | 'UNBAN', userId: string, userEmail: string) => {
        setActionModal({ isOpen: true, type, userId, userEmail });
    };

    return (
        <AdminPageTransition className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>USER TELEMETRY</h1>
                </div>
                <div className={styles.controls}>
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className={styles.input}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className={styles.select}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as AdminUserStatus | '')}
                    >
                        <option value="">ALL STATUSES</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="BANNED">BANNED</option>
                    </select>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>UID / EMAIL</th>
                            <th>STATUS</th>
                            <th>KYC</th>
                            <th>RESTRICTION EXPIRY</th>
                            <th>CREATED</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>INITIALIZING DATA STREAM...</td></tr>
                        ) : data?.data.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>NO RECORDS FOUND.</td></tr>
                        ) : (
                            data?.data.map((user) => (
                                <tr key={user.id} style={{ opacity: isFetching ? 0.5 : 1 }}>
                                    <td>
                                        <div style={{ color: 'var(--admin-text-primary)', marginBottom: '4px' }}>{user.email}</div>
                                        <div style={{ color: 'var(--admin-text-secondary)', fontSize: '10px' }}>{user.id}</div>
                                    </td>
                                    <td>{getStatusBadge(user.accountStatus)}</td>
                                    <td>
                                        <span style={{ color: user.kycCompleted ? 'var(--badge-active-text)' : 'var(--admin-text-secondary)' }}>
                                            {user.kycCompleted ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.suspendedUntil ? new Date(user.suspendedUntil).toLocaleString() : '—'}
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            {user.accountStatus === 'ACTIVE' && (
                                                <>
                                                    <button onClick={() => handleActionClick('SUSPEND', user.id, user.email)} className={`${styles.actionBtn} ${styles.warning}`}>SUSPEND</button>
                                                    <button onClick={() => handleActionClick('BAN', user.id, user.email)} className={`${styles.actionBtn} ${styles.danger}`}>BAN</button>
                                                </>
                                            )}
                                            {user.accountStatus === 'SUSPENDED' && (
                                                <button onClick={() => handleActionClick('UNSUSPEND', user.id, user.email)} className={styles.actionBtn}>LIFT SUSPENSION</button>
                                            )}
                                            {user.accountStatus === 'BANNED' && (
                                                <button onClick={() => handleActionClick('UNBAN', user.id, user.email)} className={styles.actionBtn}>REVOKE BAN</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {data && (
                <div className={styles.pagination}>
                    <span>DISPLAYING {(page - 1) * 15 + 1} - {Math.min(page * 15, data.meta.total)} OF {data.meta.total}</span>
                    <div className={styles.pageControls}>
                        <button 
                            className={styles.actionBtn} 
                            disabled={page === 1} 
                            onClick={() => setPage(p => p - 1)}
                        >
                            PREV
                        </button>
                        <button 
                            className={styles.actionBtn} 
                            disabled={page * 15 >= data.meta.total} 
                            onClick={() => setPage(p => p + 1)}
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {actionModal.isOpen && (
                    <UserActionModal
                        key="admin-action-modal"
                        type={actionModal.type}
                        userId={actionModal.userId}
                        userEmail={actionModal.userEmail}
                        onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
                    />
                )}
            </AnimatePresence>
        </AdminPageTransition>
    );
};