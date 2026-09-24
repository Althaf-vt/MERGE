import React, { useState } from 'react';
import { useGetAdminsQuery } from '../api/admin-management.api';
import { type AdminRole, type AdminStatus, type AdminDetails } from '../types/admin-management.types';
import { InviteAdminModal } from '../components/invite-admin-modal.component';
import { UpdateAdminModal } from '../components/update-admin-modal.component';
import styles from './admin-management.module.css';

export const AdminManagementPage = () => {
    // Filter State
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<AdminRole | ''>('');
    const [statusFilter, setStatusFilter] = useState<AdminStatus | ''>('');

    // Modal State
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminDetails | null>(null);

    // Fetch Data
    const { data, isLoading, isError, refetch } = useGetAdminsQuery({
        page,
        limit,
        search: search.length >= 3 ? search : undefined, // simple debounce trigger
        role: roleFilter,
        status: statusFilter,
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const handleEditClick = (admin: AdminDetails) => {
        setSelectedAdmin(admin);
    };

    const closeUpdateModal = () => {
        setSelectedAdmin(null);
    };

    const totalPages = data?.meta?.total ? Math.ceil(data.meta.total / limit) : 1;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Admin Management</h1>
                    <p>Manage system administrators, roles, and granular permissions.</p>
                </div>
                <button 
                    className={styles.primaryBtn} 
                    onClick={() => setInviteModalOpen(true)}
                >
                    + Invite Admin
                </button>
            </div>

            <div className={styles.filtersBar}>
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={search}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                />
                <select 
                    value={roleFilter} 
                    onChange={(e) => { setRoleFilter(e.target.value as AdminRole | ''); setPage(1); }}
                    className={styles.filterSelect}
                >
                    <option value="">All Roles</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <select 
                    value={statusFilter} 
                    onChange={(e) => { setStatusFilter(e.target.value as AdminStatus | ''); setPage(1); }}
                    className={styles.filterSelect}
                >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INVITED">Invited</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
                <button className={styles.refreshBtn} onClick={() => refetch()}>
                    Refresh
                </button>
            </div>

            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div className={styles.loading}>Loading administrators...</div>
                ) : isError ? (
                    <div className={styles.error}>Failed to load administrators.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Admin Details</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>No administrators found.</td>
                                </tr>
                            ) : (
                                data?.data.map((admin) => (
                                    <tr key={admin.id}>
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
                                            <button 
                                                className={styles.actionBtn}
                                                onClick={() => handleEditClick(admin)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {data?.meta && data.meta.total > limit && (
                <div className={styles.pagination}>
                    <button 
                        disabled={page === 1} 
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button 
                        disabled={page === totalPages} 
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modals */}
            <InviteAdminModal 
                isOpen={isInviteModalOpen} 
                onClose={() => setInviteModalOpen(false)} 
            />

            {selectedAdmin && (
                <UpdateAdminModal
                    isOpen={!!selectedAdmin}
                    onClose={closeUpdateModal}
                    adminId={selectedAdmin.id}
                    adminName={selectedAdmin.fullName}
                    currentRole={selectedAdmin.role}
                    currentPermissions={selectedAdmin.permissions}
                />
            )}
        </div>
    );
};