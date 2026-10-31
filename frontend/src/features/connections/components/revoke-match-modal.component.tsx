import React, { useEffect } from 'react';
import styles from './revoke-match-modal.module.css';

export interface RevokeMatchModalProps {
    isOpen: boolean;
    partnerName: string;
    isRevoking: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export const RevokeMatchModal: React.FC<RevokeMatchModalProps> = ({
    isOpen,
    partnerName,
    isRevoking,
    onConfirm,
    onClose,
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isRevoking) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isRevoking, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="revoke-modal-title">
            <div className={styles.backdrop} onClick={() => !isRevoking && onClose()} />

            <div className={styles.modalCard}>
                {/* Warning Icon Halo */}
                <div className={styles.iconCircle}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <div className={styles.content}>
                    <h3 id="revoke-modal-title" className={styles.title}>
                        Revoke Match with {partnerName}?
                    </h3>
                    <p className={styles.description}>
                        This will remove <strong>{partnerName}</strong> from your active connections and close your mutual conversation. This action cannot be undone.
                    </p>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onClose}
                        disabled={isRevoking}
                    >
                        Keep Match
                    </button>
                    <button
                        type="button"
                        className={styles.revokeButton}
                        onClick={onConfirm}
                        disabled={isRevoking}
                    >
                        {isRevoking ? (
                            <>
                                <span className={styles.spinner} />
                                <span>Revoking...</span>
                            </>
                        ) : (
                            <span>Revoke Match</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
