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

    const [suspend] = useSuspendUserMutation();
    const [unsuspend] = useUnsuspendUserMutation();
    const [ban] = useBanUserMutation();
    const [unban] = useUnbanUserMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
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
        } catch (err) {
            console.error('Failed to execute moderation action:', err);
            // Implement toast notification here if available
        }
    };

    const isDanger = type === 'BAN';
    const isSubmitDisabled = reason.trim().length < 5;

    return (
        <motion.div 
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div 
                className={styles.modal}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', visualDuration: 0.6, bounce: 0.12 }}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>EXECUTE {type}</h2>
                    <div className={styles.target}>{userEmail} ({userId})</div>
                </div>

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
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>UNIT</label>
                                <select 
                                    className={styles.select}
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value as SuspensionUnit)}
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
                        />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
                            ABORT
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitDisabled} 
                            className={`${styles.btn} ${styles.btnSubmit} ${isDanger ? styles.danger : ''}`}
                        >
                            CONFIRM {type}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};