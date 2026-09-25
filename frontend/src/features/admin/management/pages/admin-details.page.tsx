import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useGetAdminDetailsQuery } from '../api/admin-management.api';
import { AdminStatusModal, type AdminActionType } from '../components/admin-status-modal.component';
import { AdminInviteActionModal, type InviteActionType } from '../components/admin-invite-action-modal.component';
import { AdminForceLogoutModal } from '../components/admin-force-logout-modal.component';
import { UpdateAdminModal } from '../components/update-admin-modal.component';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import styles from './admin-details.module.css';

export const AdminDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, isLoading, isError, refetch } = useGetAdminDetailsQuery(id!);

    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [statusModalConfig, setStatusModalConfig] = useState<{
        isOpen: boolean;
        adminId: string;
        adminName: string;
        actionType: AdminActionType;
    } | null>(null);
    const [inviteActionModalConfig, setInviteActionModalConfig] = useState<{
        isOpen: boolean;
        adminId: string;
        adminName: string;
        actionType: InviteActionType;
    } | null>(null);
    const [isForceLogoutModalOpen, setForceLogoutModalOpen] = useState(false);

    const admin = data?.data;

    const handleStatusAction = (actionType: AdminActionType) => {
        if (!admin) return;
        setStatusModalConfig({
            isOpen: true,
            adminId: admin.id,
            adminName: admin.fullName,
            actionType
        });
    };

    const handleInviteAction = (actionType: InviteActionType) => {
        if (!admin) return;
        setInviteActionModalConfig({
            isOpen: true,
            adminId: admin.id,
            adminName: admin.fullName,
            actionType
        });
    };

    if (isLoading) return <div className={styles.loading}>LOADING PERSONNEL DATA...</div>;
    if (isError || !admin) return <div className={styles.error}>PERSONNEL RECORD NOT FOUND.</div>;

    return (
        <AdminPageTransition className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button className={styles.backBtn} onClick={() => navigate('/admin/management')}>
                        ← BACK TO PERSONNEL
                    </button>
                    <h1 className={styles.title}>{admin.fullName.toUpperCase()}</h1>
                    <div className={styles.badges}>
                        <span className={`${styles.badge} ${styles[`role_${admin.role}`]}`}>
                            {admin.role.replace('_', ' ')}
                        </span>
                        <span className={`${styles.badge} ${styles[`status_${admin.status}`]}`}>
                            {admin.status}
                        </span>
                    </div>
                </div>
                <div className={styles.controls}>
                    <button className={styles.actionBtn} onClick={() => refetch()}>REFRESH</button>

                    {admin.status === 'INVITED' ? (
                        <>
                            {admin.inviteExpiresAt && new Date(admin.inviteExpiresAt).getTime() < Date.now() ? (
                                <button className={`${styles.actionBtn} ${styles.reactivateBtn}`} onClick={() => handleInviteAction('REINVITE')}>
                                    RE-INVITE
                                </button>
                            ) : (
                                <span className={styles.pendingText}>PENDING</span>
                            )}
                            <button className={`${styles.actionBtn} ${styles.suspendBtn}`} onClick={() => handleInviteAction('CANCEL')}>
                                CANCEL INVITE
                            </button>
                        </>
                    ) : (
                        <>
                            <button className={styles.actionBtn} onClick={() => setUpdateModalOpen(true)}>EDIT ROLE/PERMS</button>
                            
                            {admin.role !== 'SUPER_ADMIN' && (
                                <>
                                    {admin.status === 'ACTIVE' && (
                                        <button className={styles.actionBtn} onClick={() => setForceLogoutModalOpen(true)}>
                                            FORCE LOGOUT
                                        </button>
                                    )}

                                    {admin.status === 'SUSPENDED' || admin.status === 'DEACTIVATED' ? (
                                        <button className={`${styles.actionBtn} ${styles.reactivateBtn}`} onClick={() => handleStatusAction('REACTIVATE')}>
                                            REACTIVATE
                                        </button>
                                    ) : (
                                        <button className={`${styles.actionBtn} ${styles.suspendBtn}`} onClick={() => handleStatusAction('SUSPEND')}>
                                            SUSPEND
                                        </button>
                                    )}
                                    
                                    {admin.status !== 'DEACTIVATED' && (
                                        <button className={`${styles.actionBtn} ${styles.suspendBtn}`} onClick={() => handleStatusAction('DEACTIVATE')}>
                                            DEACTIVATE
                                        </button>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </header>

            <div className={styles.gridContainer}>
                {/* Details Card */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>IDENTITY & ACCESS</h3>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Email Address</span>
                        <span className={styles.value}>{admin.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Internal ID</span>
                        <span className={styles.value}>{admin.id}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Last Login</span>
                        <span className={styles.value}>{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Created At</span>
                        <span className={styles.value}>{new Date(admin.createdAt).toLocaleString()}</span>
                    </div>

                    <h3 className={styles.cardTitle} style={{ marginTop: '24px' }}>ASSIGNED PERMISSIONS</h3>
                    {admin.role === 'SUPER_ADMIN' ? (
                        <div className={styles.value}>Full System Access (Bypasses granular permissions)</div>
                    ) : (
                        <div className={styles.permissionsGrid}>
                            {admin.permissions.length === 0 ? (
                                <span className={styles.value}>No explicit permissions assigned.</span>
                            ) : (
                                admin.permissions.map(perm => (
                                    <span key={perm} className={styles.permTag}>{perm}</span>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Audit Timeline Card */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>AUDIT LOG & STATUS HISTORY</h3>
                    {admin.statusHistory.length === 0 ? (
                        <div className={styles.value}>No status changes recorded.</div>
                    ) : (
                        <div className={styles.timeline}>
                            {[...admin.statusHistory].reverse().map((log, idx) => (
                                <div key={idx} className={styles.timelineItem}>
                                    <div className={styles.timelineDot} />
                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineHeader}>
                                            <span className={`${styles.badge} ${styles[`status_${log.status}`]}`}>
                                                {log.status}
                                            </span>
                                            <span className={styles.timelineDate}>{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className={styles.timelineReason}>"{log.reason}"</p>
                                        <p className={styles.timelineActionBy}>Action by: {log.actionBy}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isUpdateModalOpen && (
                    <UpdateAdminModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => setUpdateModalOpen(false)}
                        adminId={admin.id}
                        adminName={admin.fullName}
                        currentRole={admin.role}
                        currentPermissions={admin.permissions}
                    />
                )}
                
                {statusModalConfig && (
                    <AdminStatusModal
                        isOpen={statusModalConfig.isOpen}
                        onClose={() => setStatusModalConfig(null)}
                        adminId={statusModalConfig.adminId}
                        adminName={statusModalConfig.adminName}
                        actionType={statusModalConfig.actionType}
                    />
                )}
                
                {inviteActionModalConfig && (
                    <AdminInviteActionModal
                        isOpen={inviteActionModalConfig.isOpen}
                        onClose={() => {
                            setInviteActionModalConfig(null);
                            // If they cancelled the invite, redirect since entity is gone
                            if (inviteActionModalConfig.actionType === 'CANCEL') {
                                navigate('/admin/management');
                            }
                        }}
                        adminId={inviteActionModalConfig.adminId}
                        adminName={inviteActionModalConfig.adminName}
                        actionType={inviteActionModalConfig.actionType}
                    />
                )}

                {isForceLogoutModalOpen && (
                    <AdminForceLogoutModal
                        isOpen={isForceLogoutModalOpen}
                        onClose={() => setForceLogoutModalOpen(false)}
                        adminId={admin.id}
                        adminName={admin.fullName}
                    />
                )}
            </AnimatePresence>
        </AdminPageTransition>
    );
};