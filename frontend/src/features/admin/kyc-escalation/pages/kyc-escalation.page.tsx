import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'motion/react';
import type { RootState } from '../../../../app/store';
import { useGetKycTasksQuery } from '../api/kyc-escalation.api';
import type { KycTaskStatus, ClaimStatus, KycEscalationTask } from '../types/kyc-escalation.types';
import { KycReviewModal } from '../components/kyc-review-modal.component';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import { ADMIN_ROLES } from '../../../../shared/admin/constants/admin-rbac.constants';
import { DEFAULT_KYC_STATUS_FILTER, KYC_CLAIM_OPTIONS, KYC_CLAIM_STATUS, KYC_STATUS_OPTIONS, KYC_TASK_STATUS } from '../constants/kyc-escalation.constants';
import styles from './kyc-escalation.module.css';

export const KycEscalationPage: React.FC = () => {
    const currentAdmin = useSelector((state: RootState) => state.adminAuth.admin);
    const currentAdminId = currentAdmin?.id || '';
    const isSuperAdmin = currentAdmin?.role === ADMIN_ROLES.SUPER_ADMIN;

    const [page, setPage] = useState(1);
    const limit = 15;
    const [statusFilter, setStatusFilter] = useState<KycTaskStatus | ''>(DEFAULT_KYC_STATUS_FILTER);
    const [claimStatusFilter, setClaimStatusFilter] = useState<ClaimStatus | ''>('');
    const [claimedByFilter, setClaimedByFilter] = useState('');

    const [selectedTask, setSelectedTask] = useState<KycEscalationTask | null>(null);

    const { data, isLoading, isFetching, refetch } = useGetKycTasksQuery({
        page,
        limit,
        status: statusFilter || undefined,
        claimStatus: claimStatusFilter || undefined,
        claimedBy: claimedByFilter || undefined,
    });

    const tasks = data?.data || [];
    const total = data?.meta?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const activeTask = selectedTask ? tasks.find((t) => t.id === selectedTask.id) || selectedTask : null;

    const toggleMyClaims = () => {
        if (claimedByFilter === currentAdminId) {
            setClaimedByFilter('');
        } else {
            setClaimedByFilter(currentAdminId);
        }
        setPage(1);
    };

    return (
        <AdminPageTransition className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>KYC ESCALATION QUEUE</h1>
                    <p className={styles.subtitle}>REVIEW AND RESOLVE ESCALATED IDENTITY VERIFICATION TASKS.</p>
                </div>
                <div className={styles.controls}>
                    <select
                        className={styles.select}
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as KycTaskStatus | '');
                            setPage(1);
                        }}
                    >
                        {KYC_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className={styles.select}
                        value={claimStatusFilter}
                        onChange={(e) => {
                            setClaimStatusFilter(e.target.value as ClaimStatus | '');
                            setPage(1);
                        }}
                    >
                        {KYC_CLAIM_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className={`${styles.filterBtn} ${claimedByFilter === currentAdminId ? styles.filterBtnActive : ''}`}
                        onClick={toggleMyClaims}
                        title="Filter tasks claimed by me"
                    >
                        MY CLAIMS
                    </button>

                    <input
                        type="text"
                        className={styles.input}
                        placeholder="ADMIN ID..."
                        value={claimedByFilter}
                        onChange={(e) => {
                            setClaimedByFilter(e.target.value);
                            setPage(1);
                        }}
                    />

                    <button className={styles.actionBtn} onClick={() => refetch()} disabled={isFetching}>
                        {isFetching ? 'REFRESHING...' : 'REFRESH'}
                    </button>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>TARGET USER ID</th>
                            <th>DOCUMENT</th>
                            <th>COUNTRY</th>
                            <th>FACE MATCH</th>
                            <th>LIVENESS</th>
                            <th>DECISION</th>
                            <th>CLAIM STATE</th>
                            <th>CREATED</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={9} className={styles.loading}>
                                    INITIALIZING DATA STREAM...
                                </td>
                            </tr>
                        ) : tasks.length === 0 ? (
                            <tr>
                                <td colSpan={9} className={styles.emptyState}>
                                    NO KYC ESCALATION TASKS FOUND.
                                </td>
                            </tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.id} style={{ opacity: isFetching ? 0.6 : 1 }}>
                                    <td className={styles.userIdCell} title={task.targetUserId}>
                                        {task.targetUserId}
                                    </td>
                                    <td>
                                        <span className={styles.docType}>
                                            {task.documentType ? task.documentType.replace(/_/g, ' ') : 'N/A'}
                                        </span>
                                    </td>
                                    <td>{task.issuingCountry || 'N/A'}</td>
                                    <td style={{ fontFamily: 'monospace' }}>
                                        {typeof task.faceMatchScore === 'number'
                                            ? task.faceMatchScore.toFixed(2)
                                            : task.faceMatchScore}
                                    </td>
                                    <td style={{ fontFamily: 'monospace' }}>
                                        {typeof task.livenessScore === 'number'
                                            ? (task.livenessScore <= 1
                                                ? `${(task.livenessScore * 100).toFixed(1)}%`
                                                : `${task.livenessScore.toFixed(1)}%`)
                                            : task.livenessScore}
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[`badge_${task.taskStatus}`]}`}>
                                            {task.taskStatus.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                            <span className={`${styles.badge} ${styles[`badge_${task.claimStatus}`]}`}>
                                                {task.claimStatus}
                                            </span>
                                            {task.claimStatus === KYC_CLAIM_STATUS.CLAIMED && task.claimedBy && (
                                                <span style={{ fontSize: '10px', color: 'var(--admin-text-subtle)' }}>
                                                    BY: {task.claimedBy === currentAdminId ? 'YOU' : task.claimedBy.slice(0, 10)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>
                                        {new Date(task.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className={styles.actionBtn} onClick={() => setSelectedTask(task)}>
                                            {task.taskStatus !== KYC_TASK_STATUS.PENDING
                                                ? 'VIEW'
                                                : task.claimStatus === KYC_CLAIM_STATUS.UNCLAIMED
                                                    ? 'CLAIM'
                                                    : 'REVIEW'}
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
                    <span>
                        DISPLAYING {(page - 1) * limit + 1} - {Math.min(page * limit, total)} OF {total}
                    </span>
                    <div className={styles.pageControls}>
                        <button className={styles.actionBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                            PREV
                        </button>
                        <button
                            className={styles.actionBtn}
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {activeTask && (
                    <KycReviewModal
                        isOpen={!!activeTask}
                        task={activeTask}
                        currentAdminId={currentAdminId}
                        isSuperAdmin={isSuperAdmin}
                        onClose={() => setSelectedTask(null)}
                    />
                )}
            </AnimatePresence>
        </AdminPageTransition>
    );
};
