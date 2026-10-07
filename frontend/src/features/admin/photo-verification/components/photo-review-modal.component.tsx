import React, { useState } from 'react';
import styles from './photo-review-modal.module.css';
import type { PhotoVerificationTask } from '../types/photo-verification.types';
import { PhotoComparison } from './photo-comparison.component';
import { 
    useApprovePhotoMutation, 
    useClaimTaskMutation, 
    useRejectPhotoMutation, 
    useReleaseTaskMutation, 
    useTakeoverTaskMutation 
} from '../api/photo-verification.api';

interface PhotoReviewModalProps {
    task: PhotoVerificationTask;
    currentAdminId: string;
    isSuperAdmin: boolean;
    onClose: () => void;
}

export const PhotoReviewModal: React.FC<PhotoReviewModalProps> = ({
    task,
    currentAdminId,
    isSuperAdmin,
    onClose
}) => {
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [claimTask, { isLoading: isClaiming }] = useClaimTaskMutation();
    const [releaseTask, { isLoading: isReleasing }] = useReleaseTaskMutation();
    const [takeoverTask, { isLoading: isTakingOver }] = useTakeoverTaskMutation();
    const [approvePhoto, { isLoading: isApproving }] = useApprovePhotoMutation();
    const [rejectPhoto, { isLoading: isSubmittingReject }] = useRejectPhotoMutation();

    const isOwner = task.claimStatus === 'CLAIMED' && task.claimedBy === currentAdminId;
    const isClaimedByOther = task.claimStatus === 'CLAIMED' && task.claimedBy !== currentAdminId;
    const canResolve = isOwner || isSuperAdmin;
    const isResolved = task.taskStatus !== 'PENDING';

    const handleClaim = async () => {
        try { await claimTask(task.id).unwrap(); } 
        catch (err: any) { setErrorMsg(err.data?.message || 'Failed to claim task.'); }
    };

    const handleRelease = async () => {
        try { await releaseTask(task.id).unwrap(); } 
        catch (err: any) { setErrorMsg(err.data?.message || 'Failed to release claim.'); }
    };

    const handleTakeover = async () => {
        try { await takeoverTask(task.id).unwrap(); } 
        catch (err: any) { setErrorMsg(err.data?.message || 'Failed to takeover claim.'); }
    };

    const handleApprove = async () => {
        try {
            await approvePhoto(task.id).unwrap();
            onClose();
        } catch (err: any) {
            setErrorMsg(err.data?.message || 'Failed to approve photo.');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setErrorMsg('A rejection reason is required.');
            return;
        }
        try {
            await rejectPhoto({ taskId: task.id, reason: rejectReason }).unwrap();
            onClose();
        } catch (err: any) {
            setErrorMsg(err.data?.message || 'Failed to reject photo.');
        }
    };

    const isLoading = isClaiming || isReleasing || isTakingOver || isApproving || isSubmittingReject;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                
                <header className={styles.header}>
                    <h2 className={styles.title}>Review Profile Photo</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </header>

                <div className={styles.body}>
                    {/* Operational Lock Banner */}
                    {task.claimStatus === 'UNCLAIMED' && !isResolved && (
                        <div className={styles.lockBanner}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            This task is currently unclaimed. You must claim it before making a decision.
                        </div>
                    )}

                    {isClaimedByOther && !isResolved && (
                        <div className={styles.lockBanner}>
                            <svg className={styles.lockedIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            This task is currently locked and claimed by Admin ID: {task.claimedBy}.
                        </div>
                    )}

                    {isResolved && (
                        <div className={styles.lockBanner}>
                            Task has been resolved. Final Status: <strong>{task.taskStatus}</strong>
                        </div>
                    )}

                    <PhotoComparison 
                        kycSelfieUrl={task.kycSelfieUrl}
                        uploadedPhotoUrl={task.uploadedPhotoUrl}
                        faceMatchScore={task.faceMatchScore}
                    />

                    {isRejecting && canResolve && !isResolved && (
                        <div className={styles.rejectSection}>
                            <label className={styles.title} style={{ fontSize: '1rem' }}>Reason for Rejection</label>
                            <textarea 
                                className={styles.rejectInput}
                                placeholder="Explain why the photo does not match the baseline..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}
                </div>

                <footer className={styles.footer}>
                    <button className={styles.btnOutline} onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>

                    {/* State: UNCLAIMED */}
                    {task.claimStatus === 'UNCLAIMED' && !isResolved && (
                        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleClaim} disabled={isLoading}>
                            Claim Task
                        </button>
                    )}

                    {/* State: CLAIMED (Super Admin Takeover) */}
                    {isClaimedByOther && isSuperAdmin && !isResolved && (
                        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleTakeover} disabled={isLoading}>
                            Force Takeover
                        </button>
                    )}

                    {/* State: CLAIMED (Owner) */}
                    {isOwner && !isResolved && (
                        <button className={styles.btnOutline} onClick={handleRelease} disabled={isLoading}>
                            Release Claim
                        </button>
                    )}

                    {/* Resolution Buttons */}
                    {canResolve && !isResolved && !isRejecting && (
                        <>
                            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => setIsRejecting(true)} disabled={isLoading}>
                                Reject Photo
                            </button>
                            <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleApprove} disabled={isLoading}>
                                Approve Match
                            </button>
                        </>
                    )}

                    {/* Confirm Rejection */}
                    {isRejecting && canResolve && !isResolved && (
                        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleReject} disabled={isLoading}>
                            Confirm Rejection
                        </button>
                    )}
                </footer>

            </div>
        </div>
    );
};