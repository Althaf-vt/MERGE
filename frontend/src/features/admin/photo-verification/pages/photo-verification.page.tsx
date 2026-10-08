import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'motion/react';
import type { RootState } from '../../../../app/store';
import { useGetPhotoTasksQuery } from '../api/photo-verification.api';
import type { PhotoTaskStatus, ClaimStatus, PhotoVerificationTask } from '../types/photo-verification.types';
import { PhotoReviewModal } from '../components/photo-review-modal.component';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import styles from './photo-verification.module.css';

export const PhotoVerificationPage: React.FC = () => {
    const currentAdmin = useSelector((state: RootState) => state.adminAuth.admin);
    const currentAdminId = currentAdmin?.id || '';
    const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

    const [page, setPage] = useState(1);
    const limit = 15;
    const [statusFilter, setStatusFilter] = useState<PhotoTaskStatus | ''>('PENDING');
    const [claimStatusFilter, setClaimStatusFilter] = useState<ClaimStatus | ''>('');
    const [claimedByFilter, setClaimedByFilter] = useState('');

    const [selectedTask, setSelectedTask] = useState<PhotoVerificationTask | null>(null);

    const { data, isLoading, isFetching, refetch } = useGetPhotoTasksQuery({
        page,
        limit,
        status: statusFilter || undefined,
        claimStatus: claimStatusFilter || undefined,
        claimedBy: claimedByFilter || undefined,
    });

    const tasks = data?.data || [];
    const total = data?.meta.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <AdminPageTransition className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>PHOTO VERIFICATION QUEUE</h1>
                    <p className={styles.subtitle}>REVIEW FLAGGED PROFILE PHOTOS AGAINST BIOMETRIC BASELINES.</p>
                </div>
                <div className={styles.controls}>
                    <select 
                        className={styles.select} 
                        value={statusFilter} 
                        onChange={e => { setStatusFilter(e.target.value as PhotoTaskStatus | ''); setPage(1); }}
                    >
                        <option value="">ALL STATUSES</option>
                        <option value="PENDING">PENDING REVIEW</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                    </select>

                    <select 
                        className={styles.select} 
                        value={claimStatusFilter} 
                        onChange={e => { setClaimStatusFilter(e.target.value as ClaimStatus | ''); setPage(1); }}
                    >
                        <option value="">ALL CLAIMS</option>
                        <option value="UNCLAIMED">UNCLAIMED</option>
                        <option value="CLAIMED">CLAIMED</option>
                        <option value="RESOLVED">RESOLVED</option>
                    </select>

                    <input 
                        type="text" 
                        className={styles.input}
                        placeholder="ADMIN ID..." 
                        value={claimedByFilter} 
                        onChange={e => { setClaimedByFilter(e.target.value); setPage(1); }}
                    />
                    
                    <button className={styles.actionBtn} onClick={() => refetch()}>
                        REFRESH
                    </button>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>TARGET USER ID</th>
                            <th>SUBMITTED ON</th>
                            <th>L2 DISTANCE</th>
                            <th>DECISION</th>
                            <th>CLAIM STATE</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className={styles.loading}>INITIALIZING DATA STREAM...</td></tr>
                        ) : tasks.length === 0 ? (
                            <tr><td colSpan={6} className={styles.emptyState}>NO PHOTO TASKS FOUND.</td></tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.id} style={{ opacity: isFetching ? 0.5 : 1 }}>
                                    <td>{task.targetUserId}</td>
                                    <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                                    <td style={{ fontFamily: 'monospace' }}>{task.faceMatchScore.toFixed(4)}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[`badge_${task.taskStatus}`]}`}>
                                            {task.taskStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                            <span className={`${styles.badge} ${styles[`badge_${task.claimStatus}`]}`}>
                                                {task.claimStatus}
                                            </span>
                                            {task.claimStatus === 'CLAIMED' && (
                                                <span style={{ fontSize: '10px', color: 'var(--admin-text-subtle)' }}>
                                                    BY: {task.claimedBy}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button className={styles.actionBtn} onClick={() => setSelectedTask(task)}>
                                            {task.taskStatus === 'PENDING' ? 'REVIEW' : 'VIEW'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!isLoading && tasks.length > 0 && (
                <div className={styles.pagination}>
                    <span>DISPLAYING {(page - 1) * limit + 1} - {Math.min(page * limit, total)} OF {total}</span>
                    <div className={styles.pageControls}>
                        <button className={styles.actionBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>PREV</button>
                        <button className={styles.actionBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>NEXT</button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedTask && (
                    <PhotoReviewModal 
                        isOpen={!!selectedTask}
                        task={selectedTask}
                        currentAdminId={currentAdminId}
                        isSuperAdmin={isSuperAdmin}
                        onClose={() => setSelectedTask(null)}
                    />
                )}
            </AnimatePresence>
        </AdminPageTransition>
    );
};