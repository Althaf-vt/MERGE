import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../../app/hooks';
import { useAdminLoginMutation } from '../api/admin-auth.api';
import { setAdminCredentials } from '../slices/admin-auth.slice';
import { getErrorMessage } from '../../../../shared/utils/error.util';
import { AdminAuthLayout } from '../components/admin-auth.layout';
import styles from './admin-login.module.css';

export const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [adminLogin, { isLoading }] = useAdminLoginMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await adminLogin({ email, password }).unwrap();
            dispatch(setAdminCredentials({
                accessToken: response.accessToken,
                admin: response.admin
            }));
            navigate('/admin/dashboard', { replace: true });
        } catch (err: any) {
            setError(getErrorMessage(err, 'Invalid credentials.'));
        }
    };

    return (
        <AdminAuthLayout>
            <div className={styles.header}>
                <h2>Super Admin Access</h2>
                <p>Sign in to continue to the MERGE administration console.</p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label>EMAIL ADDRESS</label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.inputIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </span>
                        <input
                            type="email"
                            placeholder="admin@merge.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>PASSWORD</label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.inputIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                            </svg>
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button" 
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <label className={styles.rememberMe}>
                        <input type="checkbox" />
                        <span>Remember Me</span>
                    </label>
                    <span className={styles.forgotLink}>Forgot Password?</span>
                </div>

                <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={isLoading}
                >
                    {isLoading ? 'Authenticating...' : 'Sign In →'}
                </button>
            </form>
        </AdminAuthLayout>
    );
};