import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { useLoginUserMutation } from "../api/auth.api";
import { Link, useNavigate } from "react-router-dom";
import styles from './login-form.module.css';
import { setCredentials } from "../slices/auth.slice";
import { GoogleAuthButton } from "./google-auth.component";
import { ErrorCode } from "../../../shared/enums/ErrorCode";

export const LoginForm = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // 1. We only need isLoading here; errors will be handled inside handleSubmit
    const [login, { isLoading }] = useLoginUserMutation();

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
            
        } catch (err: any) {
            console.error("Login failed: ", err);

            const errorCode = err?.data?.error?.code;
            const errorMessage = err?.data?.error?.message;

            // Route unverified accounts directly to OTP verification
            if (errorCode === ErrorCode.EMAIL_NOT_VERIFIED) {
                navigate('/verify-otp', { state: { email } });
                return;
            }

            // Fallback to domain error message, then generic message
            setClientError(errorMessage || "Login failed. Please check your credentials.");
        }
    };

    const EyeIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    const EyeOffIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
    );

    return (
        <div className={styles.formWrapper}>
            <div className={styles.branding}>
                <h1 className={styles.title}>Sign In</h1>
                <p className={styles.subtitle}>Welcome back. Connect with your match.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                {/* Dynamically renders the backend domain error or validation message */}
                {clientError && (
                    <div className={styles.errorBanner}>
                        {clientError}
                    </div>
                )}
                
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
                    <button type="button" className={styles.iconBtn} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                    </button>
                </div>

                <div className={styles.forgotWrapper}>
                    <Link to="/forgot-password" className={styles.forgotLink}>
                        Forgot Password?
                    </Link>
                </div>

                <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                    <span>{isLoading ? "Logging in..." : "Sign In"}</span>
                </button>
            </form>

            <div className={styles.divider}>
                <span>or</span>
            </div>
            
            <GoogleAuthButton />

            <p className={styles.footerText}>
                Don't have an account? <Link to="/register" className={styles.footerLink}>Register.</Link>
            </p>
        </div>
    );
};