import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useAppSelector } from '../../../../app/hooks';
import { useGetAdminsQuery } from '../api/admin-management.api';
import { ADMIN_ROLES, type AdminRole, type AdminStatus, type AdminDetails } from '../types/admin-management.types';
import { InviteAdminModal } from '../components/invite-admin-modal.component';
import { UpdateAdminModal } from '../components/update-admin-modal.component';
import { AdminStatusModal, type AdminActionType } from '../components/admin-status-modal.component';
import { AdminInviteActionModal, type InviteActionType } from '../components/admin-invite-action-modal.component';
import { AdminForceLogoutModal } from '../components/admin-force-logout-modal.component';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import { AdminTable, type AdminTableColumn } from '../../../../shared/admin/components/admin-table.component';
import { AdminPagination } from '../../../../shared/admin/components/admin-pagination.component';
import styles from './admin-management.module.css';

export const AdminManagementPage = () => {
    const navigate = useNavigate();

    // Current Authenticated Admin
    const { admin: currentAdmin } = useAppSelector((state) => state.adminAuth);

    // Filter State
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<AdminRole | ''>('');
    const [statusFilter, setStatusFilter] = useState<AdminStatus | ''>('');

    // Modal State
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminDetails | null>(null);
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
    const [forceLogoutConfig, setForceLogoutConfig] = useState<{
        isOpen: boolean;
        adminId: string;
        adminName: string;
    } | null>(null);

    // API Hooks
    const { data, isLoading, isFetching, refetch } = useGetAdminsQuery({
        page,
        limit,
        search: search.length >= 3 ? search : undefined,
        role: roleFilter,
        status: statusFilter,
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleStatusAction = (id: string, name: string, actionType: AdminActionType) => {
        setStatusModalConfig({
            isOpen: true,
            adminId: id,
            adminName: name,
            actionType
        });
    };

    const handleInviteAction = (id: string, name: string, actionType: InviteActionType) => {
        setInviteActionModalConfig({
            isOpen: true,
            adminId: id,
            adminName: name,
            actionType
        });
    };

    // Filter out the currently logged-in admin
    const displayedAdmins = (data?.data || []).filter(admin => admin.id !== currentAdmin?.id);

    const columns: AdminTableColumn<AdminDetails>[] = [
        {
            header: 'PERSONNEL DETAILS',
            render: (admin) => (
                <div className={styles.adminInfo}>
                    <span 
                        className={`${styles.adminName} ${styles.clickableName}`}
                        onClick={() => navigate(`/admin/management/${admin.id}`)}
                        title="View Admin Details"
                    >
                        {admin.fullName}
                    </span>
                    <span className={styles.adminEmail}>{admin.email}</span>
                </div>
            ),
        },
        {
            header: 'ROLE',
            render: (admin) => (
                <span className={`${styles.badge} ${styles[`role_${admin.role}`]}`}>
                    {admin.role.replace('_', ' ')}
                </span>
            ),
        },
        {
            header: 'STATUS',
            render: (admin) => (
                <span className={`${styles.badge} ${styles[`status_${admin.status}`]}`}>
                    {admin.status}
                </span>
            ),
        },
        {
            header: 'CREATED',
            render: (admin) => new Date(admin.createdAt).toLocaleDateString(),
        },
        {
            header: 'ACTIONS',
            render: (admin) => (
                <div className={styles.actionGroup}>
                    <button 
                        className={styles.actionBtn}
                        onClick={() => navigate(`/admin/management/${admin.id}`)}
                        title="View full audit log and profile"
                    >
                        VIEW
                    </button>

                    {admin.status === 'INVITED' ? (
                        <>
                            {admin.inviteExpiresAt && new Date(admin.inviteExpiresAt).getTime() < Date.now() ? (
                                <button 
                                    className={`${styles.actionBtn} ${styles.reactivateBtn}`}
                                    onClick={() => handleInviteAction(admin.id, admin.fullName, 'REINVITE')}
                                >
                                    RE-INVITE
                                </button>
                            ) : (
                                <span style={{ fontSize: '11px', color: 'var(--admin-text-subtle)', alignSelf: 'center', marginRight: '4px', fontWeight: 600 }}>
                                    PENDING
                                </span>
                            )}
                            
                            <button 
                                className={`${styles.actionBtn} ${styles.suspendBtn}`}
                                onClick={() => handleInviteAction(admin.id, admin.fullName, 'CANCEL')}
                            >
                                CANCEL
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className={styles.actionBtn}
                                onClick={() => setSelectedAdmin(admin)}
                            >
                                EDIT
                            </button>

                            {admin.role !== ADMIN_ROLES.SUPER_ADMIN && (
                                <>
                                    {admin.status === 'ACTIVE' && (
                                        <button 
                                            className={styles.actionBtn}
                                            onClick={() => setForceLogoutConfig({ isOpen: true, adminId: admin.id, adminName: admin.fullName })}
                                            title="Revoke session token"
                                        >
                                            LOGOUT
                                        </button>
                                    )}

                                    {admin.status === 'SUSPENDED' || admin.status === 'DEACTIVATED' ? (
                                        <button 
                                            className={`${styles.actionBtn} ${styles.reactivateBtn}`}
                                            onClick={() => handleStatusAction(admin.id, admin.fullName, 'REACTIVATE')}
                                        >
                                            REACTIVATE
                                        </button>
                                    ) : (
                                        <button 
                                            className={`${styles.actionBtn} ${styles.suspendBtn}`}
                                            onClick={() => handleStatusAction(admin.id, admin.fullName, 'SUSPEND')}
                                        >
                                            SUSPEND
                                        </button>
                                    )}
                                    
                                    {admin.status !== 'DEACTIVATED' && (
                                        <button 
                                            className={`${styles.actionBtn} ${styles.suspendBtn}`}
                                            onClick={() => handleStatusAction(admin.id, admin.fullName, 'DEACTIVATE')}
                                        >
                                            DEACTIVATE
                                        </button>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AdminPageTransition className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>ADMINISTRATIVE PERSONNEL</h1>
                    <p className={styles.subtitle}>Manage system administrators, roles, and granular permissions.</p>
                </div>
                <div className={styles.controls}>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={search}
                        onChange={handleSearchChange}
                        className={styles.input}
                    />
                    <select 
                        value={roleFilter} 
                        onChange={(e) => { setRoleFilter(e.target.value as AdminRole | ''); setPage(1); }}
                        className={styles.select}
                    >
                        <option value="">ALL ROLES</option>
                        <option value={ADMIN_ROLES.SUPER_ADMIN}>SUPER ADMIN</option>
                        <option value={ADMIN_ROLES.ADMIN}>ADMIN</option>
                    </select>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => { setStatusFilter(e.target.value as AdminStatus | ''); setPage(1); }}
                        className={styles.select}
                    >
                        <option value="">ALL STATUSES</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INVITED">INVITED</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="DEACTIVATED">DEACTIVATED</option>
                    </select>
                    <button className={styles.actionBtn} onClick={() => refetch()}>
                        REFRESH
                    </button>
                    <button 
                        className={styles.primaryBtn} 
                        onClick={() => setInviteModalOpen(true)}
                    >
                        + INVITE ADMIN
                    </button>
                </div>
            </header>

            <AdminTable
                columns={columns}
                data={displayedAdmins}
                keyExtractor={(admin) => admin.id}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="NO PERSONNEL RECORDS FOUND."
            />

            <AdminPagination
                page={page}
                limit={limit}
                total={data?.meta?.total || 0}
                onPageChange={setPage}
                isLoading={isLoading}
            />

            <AnimatePresence>
                {isInviteModalOpen && (
                    <InviteAdminModal 
                        isOpen={isInviteModalOpen} 
                        onClose={() => setInviteModalOpen(false)} 
                    />
                )}
                
                {selectedAdmin && (
                    <UpdateAdminModal
                        isOpen={!!selectedAdmin}
                        onClose={() => setSelectedAdmin(null)}
                        adminId={selectedAdmin.id}
                        adminName={selectedAdmin.fullName}
                        currentRole={selectedAdmin.role}
                        currentPermissions={selectedAdmin.permissions}
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
                        onClose={() => setInviteActionModalConfig(null)}
                        adminId={inviteActionModalConfig.adminId}
                        adminName={inviteActionModalConfig.adminName}
                        actionType={inviteActionModalConfig.actionType}
                    />
                )}

                {forceLogoutConfig && (
                    <AdminForceLogoutModal
                        isOpen={forceLogoutConfig.isOpen}
                        onClose={() => setForceLogoutConfig(null)}
                        adminId={forceLogoutConfig.adminId}
                        adminName={forceLogoutConfig.adminName}
                    />
                )}
            </AnimatePresence>
        </AdminPageTransition>
    );
};