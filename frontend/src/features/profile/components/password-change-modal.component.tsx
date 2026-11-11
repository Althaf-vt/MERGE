import React, { useState, useEffect } from 'react';
import { useUpdateSecurityPasswordMutation } from '../api/profile.api';
import { getErrorMessage } from '../../../shared/utils/error.util';
import styles from './security-modals.module.css';

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Used to dispatch logout() to kill the frontend session
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [updatePassword, { isLoading }] = useUpdateSecurityPasswordMutation();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [isOpen]);

    const calculateStrength = (pass: string) => {
        let score = 0;
        if (!pass) return score;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score; // 0 to 4
    };

    const strength = calculateStrength(newPassword);
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const strengthColors = ['#e5e7eb', '#ef4444', '#f59e0b', '#10b981', '#059669'];

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!currentPassword) {
            setError('Please enter your current password.');
            return;
        }
        if (!newPassword) {
            setError('Please enter a new password.');
            return;
        }
        if (newPassword === currentPassword) {
            setError('New password cannot be the same as your current password.');
            return;
        }
        if (strength < 3) {
            setError('Please choose a stronger password (must contain uppercase, numbers, and symbols).');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setError('');
        try {
            await updatePassword({ currentPassword, newPassword, confirmPassword }).unwrap();
            onSuccess(); // Triggers frontend logout
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to update password.'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.iconWrapper}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h3 className={styles.title}>Update Password</h3>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <p className={styles.description}>
                    Enter your current password and choose a new secure password.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Current Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                        />
                        <div className={styles.strengthMeter}>
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={styles.strengthBar}
                                    style={{
                                        backgroundColor: strength >= level ? strengthColors[strength] : '#e5e7eb',
                                    }}
                                />
                            ))}
                        </div>
                        <div
                            className={styles.strengthText}
                            style={{ color: strength > 0 ? strengthColors[strength] : '#6b7280' }}
                        >
                            {newPassword ? strengthLabels[strength] : 'Enter a password'}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className={styles.actionRow}>
                        <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.btnPrimary}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};