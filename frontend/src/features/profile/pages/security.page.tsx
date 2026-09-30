import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout } from '../../auth/slices/auth.slice';
import { 
    useGetActiveSessionsQuery, 
    useRevokeOtherSessionsMutation, 
    useRevokeSessionMutation, 
    useDeactivateAccountMutation, 
    useDeleteAccountMutation 
} from '../api/profile.api';
import { PasswordChangeModal } from '../components/password-change-modal.component';
import { EmailChangeModal } from '../components/email-change-modal.component';
import { SecurityConfirmationModal } from '../components/security-confirmation-modal.component';
import styles from './security.module.css';

// --- UTILITY FUNCTIONS ---
const parseDeviceInfo = (userAgent: string) => {
    if (!userAgent || userAgent === 'unknown device') return 'Unknown Device';
    
    let browser = 'Unknown Browser';
    if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    
    let os = 'Unknown OS';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS') && !userAgent.includes('iPhone') && !userAgent.includes('iPad')) os = 'macOS';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('Linux')) os = 'Linux';
    
    if (browser === 'Unknown Browser' && os === 'Unknown OS') {
        return userAgent.length > 30 ? `${userAgent.substring(0, 30)}...` : userAgent;
    }
    
    return `${browser} on ${os}`;
};

const formatIp = (ip: string) => {
    if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';
    if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', ''); // Clean IPv4-mapped IPv6
    return ip;
};

export const SecurityPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    
    // Auth State
    const { user } = useAppSelector(state => state.auth);
    const isGoogleAuth = (user as any)?.authProvider === 'GOOGLE';
    const displayEmail = user?.email || 'Loading...';

    // RTK Queries & Mutations
    const { data: sessionsResponse, isLoading: isLoadingSessions } = useGetActiveSessionsQuery();
    const [revokeSession] = useRevokeSessionMutation();
    const [revokeOtherSessions] = useRevokeOtherSessionsMutation();
    const [deactivateAccount, { isLoading: isDeactivating }] = useDeactivateAccountMutation();
    const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

    const activeSessions = sessionsResponse?.data || [];

    // Modal States
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'DEACTIVATE' | 'DELETE' | 'REVOKE' | 'REVOKE_ALL';
        data?: any;
    }>({ isOpen: false, type: 'DEACTIVATE' });

    // Handlers
    const handleLogoutSequence = () => {
        dispatch(logout());
        navigate('/login', { replace: true });
    };

    const handleConfirmAction = async () => {
        try {
            switch (confirmModal.type) {
                case 'DEACTIVATE':
                    await deactivateAccount().unwrap();
                    handleLogoutSequence();
                    break;
                case 'DELETE':
                    await deleteAccount().unwrap();
                    handleLogoutSequence();
                    break;
                case 'REVOKE':
                    await revokeSession(confirmModal.data).unwrap();
                    setConfirmModal({ isOpen: false, type: 'REVOKE' });
                    break;
                case 'REVOKE_ALL':
                    await revokeOtherSessions().unwrap();
                    setConfirmModal({ isOpen: false, type: 'REVOKE_ALL' });
                    break;
            }
        } catch (error) {
            console.error('Action failed:', error);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Active just now';
        if (mins < 60) return `Active ${mins} mins ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `Active ${hours} hours ago`;
        return `Active ${Math.floor(hours / 24)} days ago`;
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Security</h1>
                <p className={styles.subtitle}>Manage your account security, login activity, and account access.</p>
                <div className={styles.statusRow}>
                    <span className={`${styles.statusBadge} ${styles.badgeSuccess}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Email Verified
                    </span>
                    {!isGoogleAuth && (
                        <span className={`${styles.statusBadge} ${styles.badgeSuccess}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Password Protected
                        </span>
                    )}
                    <span className={`${styles.statusBadge} ${styles.badgeInfo}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        {activeSessions.length} Active Sessions
                    </span>
                </div>
            </header>

            {/* Account Info Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                        <div className={styles.iconWrap}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <h2 className={styles.cardTitle}>Account</h2>
                    </div>
                </div>
                
                <div className={styles.infoRow}>
                    <label className={styles.infoLabel}>Email Address</label>
                    <div className={styles.infoValueBox}>
                        <div className={styles.infoValue}>
                            {displayEmail}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#059669" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="16 10 10 16 6 12"/></svg>
                        </div>
                        {!isGoogleAuth && (
                            <button className={styles.textAction} onClick={() => setEmailModalOpen(true)}>Change</button>
                        )}
                    </div>
                </div>

                {!isGoogleAuth && (
                    <div className={styles.infoRow}>
                        <label className={styles.infoLabel}>Password</label>
                        <div className={styles.infoValueBox}>
                            <div className={styles.infoValue} style={{ letterSpacing: '0.25em', fontSize: '1.25rem', marginTop: '4px' }}>
                                ••••••••••••
                            </div>
                            <button className={styles.textAction} onClick={() => setPasswordModalOpen(true)}>Update</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Sessions Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                        <div className={styles.iconWrap}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        </div>
                        <h2 className={styles.cardTitle}>Active Sessions</h2>
                    </div>
                    {activeSessions.length > 1 && (
                        <button 
                            className={styles.revokeAllBtn}
                            onClick={() => setConfirmModal({ isOpen: true, type: 'REVOKE_ALL' })}
                        >
                            Sign Out All Other Devices
                        </button>
                    )}
                </div>

                <div className={styles.sessionList}>
                    {isLoadingSessions ? (
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading sessions...</div>
                    ) : (
                        activeSessions.map((session, index) => {
                            const isCurrent = index === 0;
                            return (
                                <div key={session.sessionId} className={styles.sessionItem}>
                                    <div className={styles.sessionDetails}>
                                        <div className={styles.deviceIcon}>
                                            {session.deviceInfo.toLowerCase().includes('mobile') || session.deviceInfo.toLowerCase().includes('iphone') ? (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                            )}
                                        </div>
                                        <div className={styles.sessionMeta}>
                                            <div className={styles.deviceName}>
                                                {parseDeviceInfo(session.deviceInfo)}
                                                {isCurrent && <span className={styles.currentBadge}>CURRENT DEVICE</span>}
                                            </div>
                                            <div className={styles.sessionLocation}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                {formatIp(session.ipAddress)} • {isCurrent ? 'Active now' : formatTimeAgo(session.lastActive)}
                                            </div>
                                        </div>
                                    </div>
                                    {!isCurrent && (
                                        <button 
                                            className={styles.revokeBtn} 
                                            title="Sign out device"
                                            onClick={() => setConfirmModal({ isOpen: true, type: 'REVOKE', data: session.sessionId })}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Account Management Grid */}
            <div className={styles.card} style={{ padding: '0', border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}>
                <div className={styles.cardHeader} style={{ marginBottom: '1rem' }}>
                    <div className={styles.cardHeaderLeft}>
                        <div className={styles.iconWrapDestructive}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <h2 className={styles.cardTitle}>Account Management</h2>
                    </div>
                </div>

                <div className={styles.managementGrid}>
                    <div className={styles.managementCard}>
                        <div>
                            <h3 className={styles.managementTitle}>Deactivate Account</h3>
                            <p className={styles.managementDesc}>
                                Temporarily hide your profile. You will not be visible in Discover, but you will keep your matches and messages.
                            </p>
                        </div>
                        <button className={styles.btnOutline} onClick={() => setConfirmModal({ isOpen: true, type: 'DEACTIVATE' })}>
                            Deactivate Profile
                        </button>
                    </div>

                    <div className={`${styles.managementCard} ${styles.danger}`}>
                        <div>
                            <h3 className={`${styles.managementTitle} ${styles.danger}`}>Delete Account</h3>
                            <p className={styles.managementDesc}>
                                Permanently remove your account and data. This action is irreversible and cannot be undone.
                            </p>
                            <div className={styles.dangerList}>
                                <span>• Profile, photos, and preferences removed.</span>
                                <span>• All matches and message history deleted.</span>
                                <span>• Active subscriptions immediately cancelled.</span>
                            </div>
                        </div>
                        <button className={`${styles.btnOutline} ${styles.btnOutlineDanger}`} onClick={() => setConfirmModal({ isOpen: true, type: 'DELETE' })}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PasswordChangeModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setPasswordModalOpen(false)} 
                onSuccess={handleLogoutSequence} 
            />
            
            <EmailChangeModal 
                isOpen={isEmailModalOpen} 
                onClose={() => setEmailModalOpen(false)} 
                onSuccess={handleLogoutSequence} 
            />

            <SecurityConfirmationModal
                isOpen={confirmModal.isOpen}
                title={
                    confirmModal.type === 'DELETE' ? 'Delete Account' :
                    confirmModal.type === 'DEACTIVATE' ? 'Deactivate Account' :
                    confirmModal.type === 'REVOKE_ALL' ? 'Sign Out All Other Devices' : 'Sign Out Device'
                }
                message={
                    confirmModal.type === 'DELETE' ? 'Are you absolutely sure you want to permanently delete your account? All data will be wiped.' :
                    confirmModal.type === 'DEACTIVATE' ? 'Are you sure you want to temporarily deactivate your profile? You will be logged out immediately.' :
                    confirmModal.type === 'REVOKE_ALL' ? 'This will instantly log out all other active sessions across all devices except this one.' :
                    'Are you sure you want to sign out this specific device?'
                }
                confirmText={
                    confirmModal.type === 'DELETE' ? 'Yes, Delete Account' :
                    confirmModal.type === 'DEACTIVATE' ? 'Yes, Deactivate' : 'Sign Out'
                }
                isDestructive={confirmModal.type === 'DELETE' || confirmModal.type === 'DEACTIVATE'}
                isLoading={isDeactivating || isDeleting}
                onClose={() => setConfirmModal({ isOpen: false, type: 'DEACTIVATE' })}
                onConfirm={handleConfirmAction}
            />
        </div>
    );
};