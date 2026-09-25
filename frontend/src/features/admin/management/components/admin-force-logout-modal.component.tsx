import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useForceLogoutAdminMutation } from '../api/admin-management.api';
import styles from './admin-modal.module.css';

interface AdminForceLogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminId: string;
    adminName: string;
}

export const AdminForceLogoutModal: React.FC<AdminForceLogoutModalProps> = ({
    isOpen, onClose, adminId, adminName
}) => {
    const [forceLogout, { isLoading }] = useForceLogoutAdminMutation();
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        
        try {
            await forceLogout(adminId).unwrap();
            onClose();
        } catch (err: any) {
            setErrorMsg(err?.data?.error?.message || 'Failed to force logout admin.');
        }
    };

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
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.97 }}
                transition={{ type: 'spring', visualDuration: 0.6, bounce: 0.12 }}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>FORCE LOGOUT</h2>
                    <button type="button" onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>

                {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                        Are you sure you want to instantly terminate the active session for <strong style={{ color: 'var(--admin-text-primary)' }}>{adminName}</strong>? They will be immediately logged out of all devices.
                    </p>

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className={`${styles.btn} ${styles.btnSubmit}`}
                            style={{ backgroundColor: 'var(--admin-danger-bg)', borderColor: 'var(--admin-danger-border)', color: 'var(--admin-danger-text)' }}
                        >
                            {isLoading ? 'Terminating...' : 'Force Logout'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};