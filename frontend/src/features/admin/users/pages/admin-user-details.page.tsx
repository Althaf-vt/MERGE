import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import styles from './admin-user-details.module.css';
import { useGetUserDetailsQuery } from '../api/admin-users.api';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import { UserActionModal } from '../components/user-action-modal.component';
import type { AdminUserStatus } from '../types/admin-users.types';

export const AdminUserDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetUserDetailsQuery(id || '', { skip: !id });

    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        type: 'SUSPEND' | 'UNSUSPEND' | 'BAN' | 'UNBAN';
        userId: string;
        userEmail: string;
    }>({ isOpen: false, type: 'SUSPEND', userId: '', userEmail: '' });

    if (isLoading) return <div className={styles.loading}>RETRIEVING IDENTITY MATRIX...</div>;
    if (isError || !data?.data) return <div className={styles.error}>IDENTITY RECORD NOT FOUND OR DESTROYED.</div>;

    const user = data.data;

    const getStatusBadge = (status: AdminUserStatus) => {
        switch (status) {
            case 'ACTIVE': return <span className={`${styles.badge} ${styles.badgeActive}`}>ACTIVE</span>;
            case 'SUSPENDED': return <span className={`${styles.badge} ${styles.badgeSuspended}`}>SUSPENDED</span>;
            case 'BANNED': return <span className={`${styles.badge} ${styles.badgeBanned}`}>BANNED</span>;
            case 'DELETED': return <span className={`${styles.badge} ${styles.badgeDeleted}`}>DELETED</span>;
            default: return null;
        }
    };

    const handleActionClick = (type: 'SUSPEND' | 'UNSUSPEND' | 'BAN' | 'UNBAN') => {
        setActionModal({ isOpen: true, type, userId: user.id, userEmail: user.email });
    };

    return (
        <AdminPageTransition className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button onClick={() => navigate('/admin/users')} className={styles.backBtn}>
                        ← BACK
                    </button>
                    <div>
                        <h1 className={styles.title}>IDENTITY INSPECTOR</h1>
                        <div className={styles.subtitle}>{user.id}</div>
                    </div>
                </div>
                
                <div className={styles.actions}>
                    {user.accountStatus === 'ACTIVE' && (
                        <>
                            <button onClick={() => handleActionClick('SUSPEND')} className={`${styles.actionBtn} ${styles.warning}`}>SUSPEND</button>
                            <button onClick={() => handleActionClick('BAN')} className={`${styles.actionBtn} ${styles.danger}`}>BAN</button>
                        </>
                    )}
                    {user.accountStatus === 'SUSPENDED' && (
                        <button onClick={() => handleActionClick('UNSUSPEND')} className={styles.actionBtn}>LIFT SUSPENSION</button>
                    )}
                    {user.accountStatus === 'BANNED' && (
                        <button onClick={() => handleActionClick('UNBAN')} className={styles.actionBtn}>REVOKE BAN</button>
                    )}
                </div>
            </header>

            <div className={styles.grid}>
                {/* Primary Data Card */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Core Telemetry</h2>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>Email Address</span>
                        <div className={styles.value}>{user.email}</div>
                    </div>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>Creation Timestamp</span>
                        <div className={styles.value}>{new Date(user.createdAt).toLocaleString()}</div>
                    </div>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>Current Status</span>
                        <div className={styles.value}>{getStatusBadge(user.accountStatus)}</div>
                    </div>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>KYC Verification</span>
                        <div className={styles.value} style={{ color: user.kycCompleted ? 'var(--badge-active-text)' : 'var(--admin-text-secondary)' }}>
                            {user.kycCompleted ? 'VERIFIED' : 'PENDING'}
                        </div>
                    </div>
                </div>

                {/* Moderation/Restriction Card */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Sentinel Status</h2>
                    {(user.accountStatus === 'SUSPENDED' || user.accountStatus === 'BANNED') ? (
                        <>
                            <div className={styles.dataRow}>
                                <span className={styles.label}>Restriction Expiry</span>
                                <div className={styles.value}>
                                    {user.accountStatus === 'BANNED' ? 'PERMANENT' : (user.suspendedUntil ? new Date(user.suspendedUntil).toLocaleString() : 'UNKNOWN')}
                                </div>
                            </div>
                            {user.statusReason && (
                                <div className={styles.restrictionBlock}>
                                    <span className={styles.restrictionLabel}>Audit Log Reason</span>
                                    <p className={styles.restrictionReason}>{user.statusReason}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.dataRow}>
                            <span className={styles.label}>System Flag</span>
                            <div className={styles.value} style={{ color: 'var(--admin-text-secondary)' }}>NO ACTIVE RESTRICTIONS DETECTED.</div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {actionModal.isOpen && (
                    <UserActionModal
                        key="admin-action-modal-details"
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