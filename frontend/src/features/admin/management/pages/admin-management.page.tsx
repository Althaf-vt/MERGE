import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useGetAdminsQuery } from '../api/admin-management.api';
import { type AdminRole, type AdminStatus, type AdminDetails } from '../types/admin-management.types';
import { InviteAdminModal } from '../components/invite-admin-modal.component';
import { UpdateAdminModal } from '../components/update-admin-modal.component';
import { AdminStatusModal, type AdminActionType } from '../components/admin-status-modal.component';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import styles from './admin-management.module.css';

export const AdminManagementPage = () => {
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

    const totalPages = data?.meta?.total ? Math.ceil(data.meta.total / limit) : 1;

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
                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                        <option value="ADMIN">ADMIN</option>
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

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>PERSONNEL DETAILS</th>
                            <th>ROLE</th>
                            <th>STATUS</th>
                            <th>CREATED</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className={styles.loading}>INITIALIZING DATA STREAM...</td></tr>
                        ) : data?.data.length === 0 ? (
                            <tr><td colSpan={5} className={styles.emptyState}>NO PERSONNEL RECORDS FOUND.</td></tr>
                        ) : (
                            data?.data.map((admin) => (
                                <tr key={admin.id} style={{ opacity: isFetching ? 0.5 : 1 }}>
                                    <td>
                                        <div className={styles.adminInfo}>
                                            <span className={styles.adminName}>{admin.fullName}</span>
                                            <span className={styles.adminEmail}>{admin.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[`role_${admin.role}`]}`}>
                                            {admin.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[`status_${admin.status}`]}`}>
                                            {admin.status}
                                        </span>
                                    </td>
                                    <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className={styles.actionGroup}>
                                            <button 
                                                className={styles.actionBtn}
                                                onClick={() => setSelectedAdmin(admin)}
                                            >
                                                EDIT
                                            </button>
                                            
                                            {admin.role !== 'SUPER_ADMIN' && (
                                                <>
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
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {data?.meta && data.meta.total > 0 && (
                <div className={styles.pagination}>
                    <span>DISPLAYING {(page - 1) * limit + 1} - {Math.min(page * limit, data.meta.total)} OF {data.meta.total}</span>
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
                            disabled={page === totalPages} 
                            onClick={() => setPage(p => p + 1)}
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            )}

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
            </AnimatePresence>
        </AdminPageTransition>
    );
};