import React, { useState, useEffect } from 'react';
import { useUpdateAdminMutation } from '../api/admin-management.api';
import styles from './admin-modal.module.css';
import { ADMIN_PERMISSIONS, type AdminPermission, type AdminRole } from '../types/admin-management.types';

interface UpdateAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminId: string;
    currentRole: AdminRole;
    currentPermissions: AdminPermission[];
    adminName: string;
}

export const UpdateAdminModal: React.FC<UpdateAdminModalProps> = ({ 
    isOpen, onClose, adminId, currentRole, currentPermissions, adminName 
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
            await updateAdmin({
                adminId,
                data: {
                    role,
                    permissions: role === 'SUPER_ADMIN' ? [] : selectedPermissions
                }
            }).unwrap();
            
            onClose();
        } catch (err: any) {
            setErrorMsg(err?.data?.error?.message || 'Failed to update admin.');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Update: {adminName}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>

                {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
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
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};