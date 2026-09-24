import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    useReinviteAdminMutation, 
    useCancelAdminInviteMutation 
} from '../api/admin-management.api';
import styles from './admin-modal.module.css';

export type InviteActionType = 'REINVITE' | 'CANCEL';

interface AdminInviteActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminId: string;
    adminName: string;
    actionType: InviteActionType;
}

export const AdminInviteActionModal: React.FC<AdminInviteActionModalProps> = ({
    isOpen, onClose, adminId, adminName, actionType
}) => {
    const [reinviteAdmin, { isLoading: isReinviting }] = useReinviteAdminMutation();
    const [cancelAdminInvite, { isLoading: isCanceling }] = useCancelAdminInviteMutation();

    const [errorMsg, setErrorMsg] = useState('');

    const isLoading = isReinviting || isCanceling;

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            if (actionType === 'REINVITE') {
                await reinviteAdmin(adminId).unwrap();
            } else if (actionType === 'CANCEL') {
                await cancelAdminInvite(adminId).unwrap();
            }
            onClose();
        } catch (err: any) {
            setErrorMsg(err?.data?.error?.message || `Failed to ${actionType.toLowerCase()} invitation.`);
        }
    };

    const getTitle = () => {
        return actionType === 'REINVITE' ? 'RE-INVITE PERSONNEL' : 'CANCEL INVITATION';
    };

    const getMessage = () => {
        if (actionType === 'REINVITE') {
            return `Are you sure you want to generate and send a new invitation link to ${adminName}? The previous expired link will be permanently invalidated.`;
        }
        return `Are you sure you want to cancel the pending invitation for ${adminName}? This will permanently delete the pending record and free up their email address.`;
    };

    const getBtnText = () => {
        if (isLoading) return 'PROCESSING...';
        return actionType === 'REINVITE' ? 'SEND NEW INVITE' : 'CONFIRM CANCEL';
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
                    <h2 className={styles.title}>{getTitle()}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>

                <div style={{ padding: '24px 24px 0 24px', fontSize: '13px', color: 'var(--admin-text-secondary)', lineHeight: '1.6' }}>
                    {getMessage()}
                </div>

                {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.btnCancel} disabled={isLoading}>
                            Close
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className={`${styles.btnSubmit} ${actionType === 'CANCEL' ? styles.suspendBtn : ''}`}
                            style={actionType === 'REINVITE' ? { backgroundColor: 'var(--badge-active-bg)', borderColor: 'var(--badge-active-bg)', color: 'var(--badge-active-text)' } : {}}
                        >
                            {getBtnText()}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};