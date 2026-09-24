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

    // Password Validation Logic
    const reqs = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    const strengthScore = Object.values(reqs).filter(Boolean).length;
    const isPasswordValid = strengthScore === 5;
    const passwordsMatch = password !== '' && password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!token) return setErrorMsg('No token provided.');
        if (!isPasswordValid) return setErrorMsg('Password does not meet all security requirements.');
        if (!passwordsMatch) return setErrorMsg('Passwords do not match.');

        try {
            const res = await acceptInvite({ token, password, confirmPassword }).unwrap();
            setSuccessMsg(res.message || 'Account activated successfully.');
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

                        {password.length > 0 && (
                            <div className={styles.validationBox}>
                                <div className={styles.strengthMeter}>
                                    <div className={`${styles.strengthBar} ${strengthScore >= 1 ? styles.active : ''} ${strengthScore === 5 ? styles.full : ''}`} />
                                    <div className={`${styles.strengthBar} ${strengthScore >= 3 ? styles.active : ''} ${strengthScore === 5 ? styles.full : ''}`} />
                                    <div className={`${styles.strengthBar} ${strengthScore >= 4 ? styles.active : ''} ${strengthScore === 5 ? styles.full : ''}`} />
                                    <div className={`${styles.strengthBar} ${strengthScore >= 5 ? styles.active : ''} ${strengthScore === 5 ? styles.full : ''}`} />
                                </div>
                                <ul className={styles.reqList}>
                                    <li className={reqs.length ? styles.met : ''}>At least 8 characters</li>
                                    <li className={reqs.uppercase ? styles.met : ''}>One uppercase letter</li>
                                    <li className={reqs.lowercase ? styles.met : ''}>One lowercase letter</li>
                                    <li className={reqs.number ? styles.met : ''}>One number</li>
                                    <li className={reqs.special ? styles.met : ''}>One special character</li>
                                </ul>
                            </div>
                        )}

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
                                className={confirmPassword.length > 0 && !passwordsMatch ? styles.inputError : ''}
                            />
                            {confirmPassword.length > 0 && passwordsMatch && (
                                <span className={styles.matchSuccess}>Passwords match ✓</span>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitBtn} 
                            disabled={isLoading || !isPasswordValid || !passwordsMatch}
                        >
                            {isLoading ? 'Activating...' : 'Activate Account'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};