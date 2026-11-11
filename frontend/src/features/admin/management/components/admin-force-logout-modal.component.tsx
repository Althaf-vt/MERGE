import React, { useState } from 'react';
import { useForceLogoutAdminMutation } from '../api/admin-management.api';
import { getErrorMessage } from '../../../../shared/utils/error.util';
import { AdminModal } from '../../../../shared/admin/components/admin-modal.component';
import styles from './admin-modal.module.css';

interface AdminForceLogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminId: string;
    adminName: string;
}

export const AdminForceLogoutModal: React.FC<AdminForceLogoutModalProps> = ({
    isOpen,
    onClose,
    adminId,
    adminName,
}) => {
    const [forceLogout, { isLoading }] = useForceLogoutAdminMutation();
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            await forceLogout(adminId).unwrap();
            onClose();
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, 'Failed to force logout admin.'));
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title="FORCE LOGOUT"
            size="sm"
        >
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <p
                    style={{
                        color: 'var(--admin-text-secondary)',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        margin: 0,
                    }}
                >
                    Are you sure you want to instantly terminate the active session for{' '}
                    <strong style={{ color: 'var(--admin-text-primary)' }}>{adminName}</strong>? They will be
                    immediately logged out of all devices.
                </p>

                <div className={styles.footer}>
                    <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`${styles.btn} ${styles.btnSubmit}`}
                        style={{
                            backgroundColor: 'var(--admin-danger-bg)',
                            borderColor: 'var(--admin-danger-border)',
                            color: 'var(--admin-danger-text)',
                        }}
                    >
                        {isLoading ? 'Terminating...' : 'Force Logout'}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
};