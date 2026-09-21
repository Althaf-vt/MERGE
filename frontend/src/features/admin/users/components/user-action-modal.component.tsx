import React, { useState } from 'react';
import { motion } from 'motion/react';
import styles from './user-action-modal.module.css';
import { 
    useSuspendUserMutation, 
    useUnsuspendUserMutation, 
    useBanUserMutation, 
    useUnbanUserMutation 
} from '../api/admin-users.api';
import type { SuspensionUnit } from '../types/admin-users.types';

interface UserActionModalProps {
    type: 'SUSPEND' | 'UNSUSPEND' | 'BAN' | 'UNBAN';
    userId: string;
    userEmail: string;
    onClose: () => void;
}

export const UserActionModal: React.FC<UserActionModalProps> = ({ type, userId, userEmail, onClose }) => {
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState(24);
    const [unit, setUnit] = useState<SuspensionUnit>('HOURS');
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [suspend, { isLoading: isSuspending }] = useSuspendUserMutation();
    const [unsuspend, { isLoading: isUnsuspending }] = useUnsuspendUserMutation();
    const [ban, { isLoading: isBanning }] = useBanUserMutation();
    const [unban, { isLoading: isUnbanning }] = useUnbanUserMutation();

    const isSubmitting = isSuspending || isUnsuspending || isBanning || isUnbanning;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        
        try {
            switch (type) {
                case 'SUSPEND':
                    await suspend({ userId, duration, unit, reason }).unwrap();
                    break;
                case 'UNSUSPEND':
                    await unsuspend({ userId, reason }).unwrap();
                    break;
                case 'BAN':
                    await ban({ userId, reason }).unwrap();
                    break;
                case 'UNBAN':
                    await unban({ userId, reason }).unwrap();
                    break;
            }
            onClose();
        } catch (err: unknown) {
            const apiError = err as { data?: { error?: { message?: string }; message?: string } };
            const message = apiError?.data?.error?.message || apiError?.data?.message || 'Action failed to execute.';
            setSubmitError(message);
        }
    };

    const isDanger = type === 'BAN';
    const isSubmitDisabled = reason.trim().length < 5 || isSubmitting;

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
                    <h2 className={styles.title}>EXECUTE {type}</h2>
                    <div className={styles.target}>{userEmail} ({userId})</div>
                </div>

                {submitError && (
                    <div style={{
                        padding: '8px 12px',
                        marginBottom: '16px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--admin-danger-bg)',
                        border: '1px solid var(--admin-danger-border)',
                        color: 'var(--admin-danger-text)'
                    }}>
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {type === 'SUSPEND' && (
                        <div className={styles.durationGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>DURATION</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    className={styles.input} 
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>UNIT</label>
                                <select 
                                    className={styles.select}
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value as SuspensionUnit)}
                                    disabled={isSubmitting}
                                >
                                    <option value="HOURS">HOURS</option>
                                    <option value="DAYS">DAYS</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>AUDIT REASON (Required)</label>
                        <textarea 
                            className={styles.textarea}
                            placeholder="Provide detailed justification for the audit log..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            minLength={5}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.footer}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className={`${styles.btn} ${styles.btnCancel}`}
                            disabled={isSubmitting}
                        >
                            ABORT
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitDisabled} 
                            className={`${styles.btn} ${styles.btnSubmit} ${isDanger ? styles.danger : ''}`}
                        >
                            {isSubmitting ? 'PROCESSING...' : `CONFIRM ${type}`}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};