import React, { useState, useEffect } from 'react';
import { useUpdateAdminMutation } from '../api/admin-management.api';
import { getErrorMessage } from '../../../../shared/utils/error.util';
import { AdminModal } from '../../../../shared/admin/components/admin-modal.component';
import styles from './admin-modal.module.css';
import { ADMIN_PERMISSIONS, ADMIN_ROLES, type AdminPermission, type AdminRole } from '../types/admin-management.types';

interface UpdateAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminId: string;
    currentRole: AdminRole;
    currentPermissions: AdminPermission[];
    adminName: string;
}

export const UpdateAdminModal: React.FC<UpdateAdminModalProps> = ({
    isOpen,
    onClose,
    adminId,
    currentRole,
    currentPermissions,
    adminName,
}) => {
    const [updateAdmin, { isLoading }] = useUpdateAdminMutation();

    const [role, setRole] = useState<AdminRole>(currentRole);
    const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>(currentPermissions);
    const [errorMsg, setErrorMsg] = useState('');

    // Sync state if props change when modal opens
    useEffect(() => {
        setRole(currentRole);
        setSelectedPermissions(currentPermissions);
        setErrorMsg('');
    }, [isOpen, currentRole, currentPermissions]);

    const handlePermissionToggle = (permission: AdminPermission) => {
        setSelectedPermissions((prev) =>
            prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            await updateAdmin({
                adminId,
                data: {
                    role,
                    permissions: role === ADMIN_ROLES.SUPER_ADMIN ? [] : selectedPermissions,
                },
            }).unwrap();

            onClose();
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, 'Failed to update admin.'));
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`UPDATE PERSONNEL: ${adminName}`}
            size="md"
        >
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
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
                    <button type="button" onClick={onClose} className={styles.btnCancel}>
                        Cancel
                    </button>
                    <button type="submit" disabled={isLoading} className={styles.btnSubmit}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
};
