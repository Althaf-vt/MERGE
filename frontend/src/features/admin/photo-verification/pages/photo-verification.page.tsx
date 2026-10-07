import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useGetPhotoTasksQuery } from '../api/photo-verification.api';
import type { PhotoTaskStatus, ClaimStatus, PhotoVerificationTask } from '../types/photo-verification.types';
import { PhotoReviewModal } from '../components/photo-review-modal.component';
import styles from './photo-verification.module.css';

export const PhotoVerificationPage: React.FC = () => {
    // Redux Admin State
    const currentAdmin = useSelector((state: RootState) => state.adminAuth.admin);
    const currentAdminId = currentAdmin?.id || '';
    const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

    // Filters and Pagination State
    const [page, setPage] = useState(1);
    const limit = 15;
    const [statusFilter, setStatusFilter] = useState<PhotoTaskStatus | ''>('PENDING');
    const [claimStatusFilter, setClaimStatusFilter] = useState<ClaimStatus | ''>('');
    const [claimedByFilter, setClaimedByFilter] = useState('');

    // Modal State
    const [selectedTask, setSelectedTask] = useState<PhotoVerificationTask | null>(null);

    // RTK Query
    const { data, isLoading, isFetching } = useGetPhotoTasksQuery({
        page,
        limit,
        status: statusFilter || undefined,
        claimStatus: claimStatusFilter || undefined,
        claimedBy: claimedByFilter || undefined,
    });

    const tasks = data?.data || [];
    const total = data?.meta.total || 0;
    const totalPages = Math.ceil(total / limit);

    const handleClearFilters = () => {
        setStatusFilter('');
        setClaimStatusFilter('');
        setClaimedByFilter('');
        setPage(1);
    };

    const getStatusBadge = (status: PhotoTaskStatus) => {
        switch (status) {
            case 'APPROVED': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Approved</span>;
            case 'REJECTED': return <span className={`${styles.badge} ${styles.badgeDanger}`}>Rejected</span>;
            default: return <span className={`${styles.badge} ${styles.badgeWarning}`}>Pending</span>;
        }
    };

    const getClaimBadge = (status: ClaimStatus) => {
        switch (status) {
            case 'CLAIMED': return <span className={`${styles.badge} ${styles.badgeClaimed}`}>Claimed</span>;
            case 'RESOLVED': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Resolved</span>;
            default: return <span className={`${styles.badge} ${styles.badgeNeutral}`}>Unclaimed</span>;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Photo Verification Queue</h1>
                    <p className={styles.subtitle}>Review flagged profile photos against biometric baselines.</p>
                </div>
            </header>

            {/* Filter Controls */}
            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Task Status</label>
                    <select 
                        className={styles.filterSelect} 
                        value={statusFilter} 
                        onChange={e => { setStatusFilter(e.target.value as PhotoTaskStatus | ''); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Claim Status</label>
                    <select 
                        className={styles.filterSelect} 
                        value={claimStatusFilter} 
                        onChange={e => { setClaimStatusFilter(e.target.value as ClaimStatus | ''); setPage(1); }}
                    >
                        <option value="">All Claims</option>
                        <option value="UNCLAIMED">Unclaimed</option>
                        <option value="CLAIMED">Claimed</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Claimed By (Admin ID)</label>
                    <input 
                        type="text" 
                        className={styles.filterInput}
                        placeholder="Search by Admin ID..." 
                        value={claimedByFilter} 
                        onChange={e => { setClaimedByFilter(e.target.value); setPage(1); }}
                    />
                </div>

                {(statusFilter || claimStatusFilter || claimedByFilter) && (
                    <button className={styles.clearBtn} onClick={handleClearFilters}>
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Data Grid */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Target User ID</th>
                            <th className={styles.th}>Submitted On</th>
                            <th className={styles.th}>L2 Distance</th>
                            <th className={styles.th}>Decision</th>
                            <th className={styles.th}>Claim State</th>
                            <th className={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className={styles.emptyState}>Loading tasks...</td>
                            </tr>
                        ) : tasks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.emptyState}>No photo tasks found matching your filters.</td>
                            </tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.id} className={styles.tr}>
                                    <td className={styles.td}>{task.targetUserId}</td>
                                    <td className={styles.td}>{new Date(task.createdAt).toLocaleDateString()}</td>
                                    <td className={styles.td}>{task.faceMatchScore.toFixed(2)}</td>
                                    <td className={styles.td}>{getStatusBadge(task.taskStatus)}</td>
                                    <td className={styles.td}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {getClaimBadge(task.claimStatus)}
                                            {task.claimStatus === 'CLAIMED' && (
                                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>By: {task.claimedBy}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <button className={styles.actionBtn} onClick={() => setSelectedTask(task)}>
                                            {task.taskStatus === 'PENDING' ? 'Review' : 'View Details'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!isLoading && tasks.length > 0 && (
                    <div className={styles.pagination}>
                        <span className={styles.pageInfo}>
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
                            {isFetching && ' (Refreshing...)'}
                        </span>
                        <div className={styles.pageControls}>
                            <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                            <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Verification Modal */}
            {selectedTask && (
                <PhotoReviewModal 
                    task={selectedTask}
                    currentAdminId={currentAdminId}
                    isSuperAdmin={isSuperAdmin}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
};