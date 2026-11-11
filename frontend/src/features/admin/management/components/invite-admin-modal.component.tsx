import React, { useState } from 'react';
import { useInviteAdminMutation } from '../api/admin-management.api';
import { getErrorMessage } from '../../../../shared/utils/error.util';
import { AdminModal } from '../../../../shared/admin/components/admin-modal.component';
import styles from './admin-modal.module.css';
import { ADMIN_PERMISSIONS, ADMIN_ROLES, type AdminPermission, type AdminRole } from '../types/admin-management.types';

interface InviteAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InviteAdminModal: React.FC<InviteAdminModalProps> = ({ isOpen, onClose }) => {
    const [inviteAdmin, { isLoading }] = useInviteAdminMutation();

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<AdminRole>(ADMIN_ROLES.ADMIN);
    const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([]);
    const [errorMsg, setErrorMsg] = useState('');

    const handlePermissionToggle = (permission: AdminPermission) => {
        setSelectedPermissions((prev) =>
            prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
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
                permissions: role === ADMIN_ROLES.SUPER_ADMIN ? [] : selectedPermissions,
            }).unwrap();

            // Reset and close on success
            setEmail('');
            setFullName('');
            setRole(ADMIN_ROLES.ADMIN);
            setSelectedPermissions([]);
            onClose();
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, 'Failed to send invitation.'));
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title="INVITE ADMINISTRATOR"
            size="md"
        >
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className={styles.inputGroup}>
                    <label>Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>

                <div className={styles.inputGroup}>
                    <label>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
                        <option value={ADMIN_ROLES.ADMIN}>Administrator</option>
                        <option value={ADMIN_ROLES.SUPER_ADMIN}>Super Admin</option>
                    </select>
                </div>

                {role === ADMIN_ROLES.ADMIN && (
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
                    <button type="button" onClick={onClose} className={styles.cancelBtn}>
                        Cancel
                    </button>
                    <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                        {isLoading ? 'Sending...' : 'Send Invitation'}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
};
