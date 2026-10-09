import React, { useState } from 'react';
import { motion } from 'motion/react';
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
    isOpen: boolean;
    task: PhotoVerificationTask;
    currentAdminId: string;
    isSuperAdmin: boolean;
    onClose: () => void;
}

export const PhotoReviewModal: React.FC<PhotoReviewModalProps> = ({
    isOpen,
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

    if (!isOpen) return null;

    const isOwner = task.claimStatus === 'CLAIMED' && task.claimedBy === currentAdminId;
    const isClaimedByOther = task.claimStatus === 'CLAIMED' && task.claimedBy !== currentAdminId;
    const canResolve = isOwner || (isSuperAdmin && task.claimStatus === 'CLAIMED');
    const isResolved = task.taskStatus !== 'PENDING';

    const handleAction = async (actionFn: () => Promise<any>, successCallback?: () => void) => {
        setErrorMsg('');
        try {
            await actionFn();
            if (successCallback) successCallback();
        } catch (err: any) {
            setErrorMsg(err.data?.message || err?.data?.error?.message || 'Operation failed.');
        }
    };

    const isLoading = isClaiming || isReleasing || isTakingOver || isApproving || isSubmittingReject;

    return (
        <motion.div
            className={styles.overlay}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.97 }}
                transition={{ type: 'spring', visualDuration: 0.6, bounce: 0.12 }}
            >
                <header className={styles.header}>
                    <h2 className={styles.title}>REVIEW PROFILE PHOTO</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </header>

                <div className={styles.body}>
                    {task.claimStatus === 'UNCLAIMED' && !isResolved && (
                        <div className={styles.lockBanner}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            TASK UNCLAIMED. CLAIM REQUIRED BEFORE RESOLUTION.
                        </div>
                    )}

                    {isClaimedByOther && !isResolved && (
                        <div className={styles.lockBanner}>
                            <svg className={styles.lockedIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            LOCKED BY ADMIN ID: {task.claimedBy}
                        </div>
                    )}

                    {isResolved && (
                        <div className={styles.lockBanner}>
                            RESOLVED STATUS: <strong>{task.taskStatus}</strong>
                        </div>
                    )}

                    <PhotoComparison 
                        kycSelfieUrl={task.kycSelfieUrl}
                        uploadedPhotoUrl={task.uploadedPhotoUrl}
                        faceMatchScore={task.faceMatchScore}
                    />

                    {isRejecting && canResolve && !isResolved && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--admin-text-subtle)', textTransform: 'uppercase' }}>
                                REASON FOR REJECTION
                            </label>
                            <textarea 
                                className={styles.rejectInput}
                                placeholder="ENTER REJECTION REASON..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
                </div>

                <footer className={styles.footer}>
                    <button className={styles.btnCancel} onClick={onClose} disabled={isLoading}>
                        CLOSE
                    </button>

                    {task.claimStatus === 'UNCLAIMED' && !isResolved && (
                        <button className={styles.btnSubmit} onClick={() => handleAction(() => claimTask(task.id).unwrap())} disabled={isLoading}>
                            CLAIM TASK
                        </button>
                    )}

                    {isClaimedByOther && isSuperAdmin && !isResolved && (
                        <button className={styles.btnDanger} onClick={() => handleAction(() => takeoverTask(task.id).unwrap())} disabled={isLoading}>
                            FORCE TAKEOVER
                        </button>
                    )}

                    {isOwner && !isResolved && (
                        <button className={styles.btnCancel} onClick={() => handleAction(() => releaseTask(task.id).unwrap())} disabled={isLoading}>
                            RELEASE CLAIM
                        </button>
                    )}

                    {canResolve && !isResolved && !isRejecting && (
                        <>
                            <button className={styles.btnDanger} onClick={() => setIsRejecting(true)} disabled={isLoading}>
                                REJECT
                            </button>
                            <button className={styles.btnSuccess} onClick={() => handleAction(() => approvePhoto(task.id).unwrap(), onClose)} disabled={isLoading}>
                                APPROVE
                            </button>
                        </>
                    )}

                    {isRejecting && canResolve && !isResolved && (
                        <button 
                            className={styles.btnDanger} 
                            onClick={() => {
                                if (!rejectReason.trim()) { setErrorMsg('REASON REQUIRED'); return; }
                                handleAction(() => rejectPhoto({ taskId: task.id, reason: rejectReason }).unwrap(), onClose);
                            }} 
                            disabled={isLoading}
                        >
                            CONFIRM REJECTION
                        </button>
                    )}
                </footer>
            </motion.div>
        </motion.div>
    );
};