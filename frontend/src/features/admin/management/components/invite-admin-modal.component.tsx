import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useInviteAdminMutation } from '../api/admin-management.api';
import styles from './admin-modal.module.css';
import { ADMIN_PERMISSIONS, type AdminPermission, type AdminRole } from '../types/admin-management.types';

interface InviteAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InviteAdminModal: React.FC<InviteAdminModalProps> = ({ isOpen, onClose }) => {
    const [inviteAdmin, { isLoading }] = useInviteAdminMutation();

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<AdminRole>('ADMIN');
    const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([]);
    const [_errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handlePermissionToggle = (permission: AdminPermission) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            await inviteAdmin({
                email,
                fullName,
                role,
                permissions: role === 'SUPER_ADMIN' ? [] : selectedPermissions
            }).unwrap();

            // Reset and close on success
            setEmail('');
            setFullName('');
            setRole('ADMIN');
            setSelectedPermissions([]);
            onClose();
        } catch (err: any) {
            setErrorMsg(err?.data?.error?.message || 'Failed to send invitation.');
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
                    <h2 className={styles.title}>INVITE ADMINISTRATOR</h2>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Role</label>
                        <select value={role} onChange={e => setRole(e.target.value as AdminRole)}>
                            <option value="ADMIN">Administrator</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                    </div>

                    {role === 'ADMIN' && (
                        <div className={styles.permissionsSection}>
                            <label>Permissions</label>
                            <div className={styles.permissionsGrid}>
                                {Object.entries(ADMIN_PERMISSIONS).map(([key, value]) => (
                                    <label key={value} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={selectedPermissions.includes(value)}
                                            onChange={() => handlePermissionToggle(value)}
                                        />
                                        {key.replace(/_/g, ' ')}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                            {isLoading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>

            </motion.div>
        </motion.div>
    );
};