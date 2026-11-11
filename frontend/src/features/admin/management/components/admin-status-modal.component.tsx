import React, { useState, useEffect } from 'react';
import {
    useSuspendAdminMutation,
    useDeactivateAdminMutation,
    useReactivateAdminMutation,
} from '../api/admin-management.api';
import { getErrorMessage } from '../../../../shared/utils/error.util';
import { AdminModal } from '../../../../shared/admin/components/admin-modal.component';
import styles from './admin-modal.module.css';

export type AdminActionType = 'SUSPEND' | 'DEACTIVATE' | 'REACTIVATE';

interface AdminStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminId: string;
    adminName: string;
    actionType: AdminActionType;
}

export const AdminStatusModal: React.FC<AdminStatusModalProps> = ({
    isOpen,
    onClose,
    adminId,
    adminName,
    actionType,
}) => {
    const [suspendAdmin, { isLoading: isSuspending }] = useSuspendAdminMutation();
    const [deactivateAdmin, { isLoading: isDeactivating }] = useDeactivateAdminMutation();
    const [reactivateAdmin, { isLoading: isReactivating }] = useReactivateAdminMutation();

    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState(24);
    const [unit, setUnit] = useState<'HOURS' | 'DAYS'>('HOURS');
    const [errorMsg, setErrorMsg] = useState('');

    const isLoading = isSuspending || isDeactivating || isReactivating;

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setDuration(24);
            setUnit('HOURS');
            setErrorMsg('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!reason.trim()) {
            setErrorMsg('A reason must be provided for the audit log.');
            return;
        }

        try {
            if (actionType === 'SUSPEND') {
                await suspendAdmin({ adminId, duration, unit, reason }).unwrap();
            } else if (actionType === 'DEACTIVATE') {
                await deactivateAdmin({ adminId, reason }).unwrap();
            } else if (actionType === 'REACTIVATE') {
                await reactivateAdmin({ adminId, reason }).unwrap();
            }
            onClose();
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, `Failed to ${actionType.toLowerCase()} admin.`));
        }
    };

    const getTitle = () => {
        if (actionType === 'SUSPEND') return 'SUSPEND PERSONNEL';
        if (actionType === 'DEACTIVATE') return 'PERMANENTLY DEACTIVATE';
        return 'REACTIVATE PERSONNEL';
    };

    const getBtnText = () => {
        if (isLoading) return 'PROCESSING...';
        return actionType;
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={getTitle()}
            size="sm"
        >
            <div
                style={{
                    padding: '0 24px',
                    marginTop: '16px',
                    fontSize: '12px',
                    color: 'var(--admin-text-secondary)',
                }}
            >
                Target: <strong style={{ color: 'var(--admin-text-primary)' }}>{adminName}</strong>
            </div>

            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                {actionType === 'SUSPEND' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label>Duration</label>
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label>Unit</label>
                            <select value={unit} onChange={(e) => setUnit(e.target.value as 'HOURS' | 'DAYS')}>
                                <option value="HOURS">Hours</option>
                                <option value="DAYS">Days</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className={styles.inputGroup}>
                    <label>Audit Reason (Required)</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter reason for audit logs..."
                        required
                    />
                </div>

                <div className={styles.footer}>
                    <button type="button" onClick={onClose} className={styles.btnCancel}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`${styles.btnSubmit} ${actionType === 'REACTIVATE' ? '' : styles.suspendBtn}`}
                        style={
                            actionType === 'REACTIVATE'
                                ? {
                                      backgroundColor: 'var(--badge-active-bg)',
                                      borderColor: 'var(--badge-active-bg)',
                                      color: 'var(--badge-active-text)',
                                  }
                                : {}
                        }
                    >
                        {getBtnText()}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
};
