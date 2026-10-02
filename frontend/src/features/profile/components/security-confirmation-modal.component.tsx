import React from 'react';
import styles from './security-modals.module.css';

interface SecurityConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmText: string;
    isDestructive?: boolean;
    isLoading: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export const SecurityConfirmationModal: React.FC<SecurityConfirmationModalProps> = ({
    isOpen, title, message, confirmText, isDestructive = false, isLoading, onConfirm, onClose
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={`${styles.iconWrapper} ${isDestructive ? styles.iconWrapperDestructive : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <h3 className={styles.title}>{title}</h3>
                </div>
                
                <div className={styles.description}>{message}</div>
                
                <div className={styles.actionRow}>
                    <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className={`${styles.btnPrimary} ${isDestructive ? styles.btnDestructive : ''}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};