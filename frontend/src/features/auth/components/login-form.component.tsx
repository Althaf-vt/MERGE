import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { useLoginUserMutation } from "../api/auth.api";
import { Link, useNavigate } from "react-router-dom";
import styles from './login-form.module.css';
import { setCredentials } from "../slices/auth.slice";
import { GoogleAuthButton } from "./google-auth.component";

export const LoginForm = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // RTK Query hook
    const [login, { isLoading, error }] = useLoginUserMutation();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [clientError, setClientError] = useState<string | null>(null);

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setClientError(null);

        if (!email || !password) {
            setClientError("Please fill in both fields.");
            return;
        }

        try {
            // 1. Call the backend API
            const response = await login({ email, password }).unwrap();

            // 2. Save the tokens and user to the Redux store
            dispatch(setCredentials({
                accessToken: response.accessToken,
                user: response.user
            }));

            // 3. Redirect the user to the KYC onboarding screen
            navigate('/onboarding/kyc', { replace: true });
            
        } catch (error) {
            console.error("Login failed: ", error);
        }
    };

    // SVG Icons for the password toggle
    const EyeIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    const EyeOffIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    );

    return (
        <div className={styles.formWrapper}>
            <div className={styles.branding}>
                <h1 className={styles.title}>MERGE</h1>
                <p className={styles.subtitle}>Two Souls, One Journey.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                {clientError && <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>{clientError}</div>}
                {/* Error handling from NestJS backend */}
                {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>Login failed. Please check the credentials.</div>}
                
                <div className={styles.inputGroup}>
                    <input 
                        className={styles.input}
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address" 
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <input 
                        className={styles.input}
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password" 
                        required
                    />
                    <span className={styles.icon} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                    </span>
                </div>

                <div style={{ textAlign: 'right', marginTop: '-0.25rem', marginBottom: '0.25rem' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: '#6200ea', textDecoration: 'none', fontWeight: 500 }}>
                        Forgot Password?
                    </Link>
                </div>

                <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>

            <div className={styles.divider}>OR</div>
            
            {/* Integrated Google OAuth Button */}
            <GoogleAuthButton />

            <p className={styles.footerText}>
                Don't have an account? <Link to="/register" className={styles.footerLink}>Register.</Link>
            </p>
        </div>
    );
};