import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAcceptAdminInviteMutation } from '../api/admin-management.api';
import styles from './accept-invite.module.css';

export const AdminAcceptInvitePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [acceptInvite, { isLoading }] = useAcceptAdminInviteMutation();

    useEffect(() => {
        if (!token) {
            setErrorMsg('Invalid or missing invitation token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!token) {
            setErrorMsg('No token provided.');
            return;
        }

        if (password.length < 8) {
            setErrorMsg('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        try {
            const res = await acceptInvite({ token, password }).unwrap();
            setSuccessMsg(res.message || 'Account activated successfully.');
            
            // Redirect to admin login after 3 seconds
            setTimeout(() => {
                navigate('/admin/login', { replace: true });
            }, 3000);
        } catch (err: any) {
            setErrorMsg(err?.data?.error?.message || 'Failed to activate account. The link may have expired.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>MERGE <span>ADMIN</span></h1>
                    <p>Set up your secure administrative account.</p>
                </div>

                {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
                {successMsg && <div className={styles.successMessage}>{successMsg}</div>}

                {!successMsg && token && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter secure password"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Activating...' : 'Activate Account'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};