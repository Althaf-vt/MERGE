import React, { useState } from 'react';
import styles from './kyc-review-modal.module.css';
import type { KycEscalationTask } from '../types/kyc-escalation.types';
import { KYC_CLAIM_STATUS, KYC_TASK_STATUS } from '../constants/kyc-escalation.constants';
import { KycComparison } from './kyc-comparison.component';
import { KycResubmissionModal } from './kyc-resubmission-modal.component';
import { useApproveKycTaskMutation, useClaimKycTaskMutation, useRejectKycTaskMutation, useReleaseKycTaskMutation, useTakeoverKycTaskMutation } from '../api/kyc-escalation.api';
import { getErrorMessage } from '../../../../shared/utils/error.util';
import { AdminModal } from '../../../../shared/admin/components/admin-modal.component';

interface KycReviewModalProps {
    isOpen: boolean;
    task: KycEscalationTask;
    currentAdminId: string;
    isSuperAdmin: boolean;
    onClose: () => void;
}

export const KycReviewModal: React.FC<KycReviewModalProps> = ({
    isOpen,
    task,
    currentAdminId,
    isSuperAdmin,
    onClose,
}) => {
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [isResubmissionModalOpen, setIsResubmissionModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [claimTask, { isLoading: isClaiming }] = useClaimKycTaskMutation();
    const [releaseTask, { isLoading: isReleasing }] = useReleaseKycTaskMutation();
    const [takeoverTask, { isLoading: isTakingOver }] = useTakeoverKycTaskMutation();
    const [approveTask, { isLoading: isApproving }] = useApproveKycTaskMutation();
    const [rejectTask, { isLoading: isSubmittingReject }] = useRejectKycTaskMutation();

    if (!isOpen) return null;

    const isOwner = task.claimStatus === KYC_CLAIM_STATUS.CLAIMED && task.claimedBy === currentAdminId;
    const isClaimedByOther = task.claimStatus === KYC_CLAIM_STATUS.CLAIMED && task.claimedBy !== currentAdminId;
    const canResolve = isOwner || (isSuperAdmin && task.claimStatus === KYC_CLAIM_STATUS.CLAIMED);
    const isResolved = task.taskStatus !== KYC_TASK_STATUS.PENDING;

    const handleAction = async (actionFn: () => Promise<unknown>, successCallback?: () => void) => {
        setErrorMsg('');
        try {
            await actionFn();
            if (successCallback) successCallback();
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, 'Operation failed.'));
        }
    };

    const isLoading = isClaiming || isReleasing || isTakingOver || isApproving || isSubmittingReject;

    return (
        <>
            <AdminModal
                isOpen={isOpen}
                onClose={onClose}
                title="REVIEW KYC ESCALATION"
                subtitle={`USER: ${task.targetUserId} • CREATED: ${new Date(task.createdAt).toLocaleString()}`}
                size="xl"
                contentClassName={styles.modal}
            >
                <div className={styles.body}>
                        {task.claimStatus === KYC_CLAIM_STATUS.UNCLAIMED && !isResolved && (
                            <div className={styles.lockBanner}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>TASK UNCLAIMED. CLAIM REQUIRED BEFORE RESOLUTION.</span>
                            </div>
                        )}

                        {isClaimedByOther && !isResolved && (
                            <div className={styles.lockBanner}>
                                <svg
                                    className={styles.lockedIcon}
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <span>LOCKED BY ADMIN: {task.claimedBy}</span>
                            </div>
                        )}

                        {isResolved && (
                            <div className={`${styles.resolvedBanner} ${styles[`status_${task.taskStatus.toLowerCase()}`] || ''}`}>
                                <div className={styles.resolvedStatus}>
                                    RESOLVED STATUS: <strong>{task.taskStatus}</strong>
                                    {task.resolvedAt && (
                                        <span className={styles.resolvedAt}>
                                            AT {new Date(task.resolvedAt).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {task.rejectionReason && (
                                    <div className={styles.resolvedDetail}>
                                        REASON: {task.rejectionReason}
                                    </div>
                                )}
                                {task.resubmissionReasons && task.resubmissionReasons.length > 0 && (
                                    <div className={styles.resolvedDetail}>
                                        REQUESTED RESUBMISSIONS: {task.resubmissionReasons.join(', ')}
                                        {task.resubmissionMessage && ` — "${task.resubmissionMessage}"`}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Media Inspection Component */}
                        <KycComparison
                            kycSelfieUrl={task.kycSelfieUrl}
                            uploadedDocumentUrl={task.uploadedDocumentUrl}
                            faceMatchScore={task.faceMatchScore}
                            livenessScore={task.livenessScore}
                            documentType={task.documentType}
                            issuingCountry={task.issuingCountry}
                        />

                        {/* Inline Rejection Input */}
                        {isRejecting && canResolve && !isResolved && (
                            <div className={styles.rejectSection}>
                                <label className={styles.rejectLabel}>
                                    REASON FOR REJECTION <span className={styles.requiredIndicator}>*</span>
                                </label>
                                <textarea
                                    className={styles.rejectInput}
                                    placeholder="ENTER SPECIFIC REJECTION REASON..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    disabled={isLoading}
                                />
                                <div className={styles.rejectActions}>
                                    <button
                                        type="button"
                                        className={styles.btnCancel}
                                        onClick={() => {
                                            setIsRejecting(false);
                                            setRejectReason('');
                                        }}
                                        disabled={isLoading}
                                    >
                                        CANCEL REJECTION
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.btnDanger}
                                        onClick={() => {
                                            if (!rejectReason.trim()) {
                                                setErrorMsg('REJECTION REASON REQUIRED');
                                                return;
                                            }
                                            handleAction(
                                                () => rejectTask({ id: task.id, reason: rejectReason.trim() }).unwrap(),
                                                onClose
                                            );
                                        }}
                                        disabled={isLoading || !rejectReason.trim()}
                                    >
                                        CONFIRM REJECTION
                                    </button>
                                </div>
                            </div>
                        )}

                        {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
                    </div>

                    <footer className={styles.footer}>
                        <button className={styles.btnCancel} onClick={onClose} disabled={isLoading}>
                            CLOSE
                        </button>

                        {task.claimStatus === KYC_CLAIM_STATUS.UNCLAIMED && !isResolved && (
                            <button
                                className={styles.btnSubmit}
                                onClick={() => handleAction(() => claimTask(task.id).unwrap())}
                                disabled={isLoading}
                            >
                                CLAIM TASK
                            </button>
                        )}

                        {isClaimedByOther && isSuperAdmin && !isResolved && (
                            <button
                                className={styles.btnDanger}
                                onClick={() => handleAction(() => takeoverTask(task.id).unwrap())}
                                disabled={isLoading}
                            >
                                FORCE TAKEOVER
                            </button>
                        )}

                        {isOwner && !isResolved && !isRejecting && (
                            <button
                                className={styles.btnCancel}
                                onClick={() => handleAction(() => releaseTask(task.id).unwrap())}
                                disabled={isLoading}
                            >
                                RELEASE CLAIM
                            </button>
                        )}

                        {canResolve && !isResolved && !isRejecting && (
                            <>
                                <button
                                    className={styles.btnDanger}
                                    onClick={() => setIsRejecting(true)}
                                    disabled={isLoading}
                                >
                                    REJECT
                                </button>
                                <button
                                    className={styles.btnWarning}
                                    onClick={() => setIsResubmissionModalOpen(true)}
                                    disabled={isLoading}
                                >
                                    REQUEST RESUBMISSION
                                </button>
                                <button
                                    className={styles.btnSuccess}
                                    onClick={() => handleAction(() => approveTask(task.id).unwrap(), onClose)}
                                    disabled={isLoading}
                                >
                                    APPROVE
                                </button>
                            </>
                        )}
                    </footer>
            </AdminModal>

            {/* Resubmission Request Sub-Modal */}
            <KycResubmissionModal
                isOpen={isResubmissionModalOpen}
                taskId={task.id}
                onClose={() => setIsResubmissionModalOpen(false)}
                onSuccess={() => {
                    setIsResubmissionModalOpen(false);
                    onClose();
                }}
            />
        </>
    );
};

