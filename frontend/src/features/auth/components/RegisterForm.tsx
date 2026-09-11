import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRegisterUserMutation } from "../api/authApi";
import { setRegisteredEmail, setRegistrationStep } from "../slices/authSlice";
import { useAppDispatch } from "../../../app/hooks";
import styles from './RegisterForm.module.css';
import { GoogleAuthButton } from "./google-auth.component";

export const RegisterForm = () => {
    const dispatch = useAppDispatch();

    // RTK Query hook gives us the trigger function and the state (isLoading, error)
    const [register, { isLoading, error }] = useRegisterUserMutation();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [clientError, setClientError] = useState<string | null>(null);

    // UI Toggle State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setClientError(null);

        if (password.length < 8) {
            setClientError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setClientError("Passwords do not match");
            return;
        }

        try {
            // unwrap() extracts the payload or throws the error so we can catch it
            await register({ email, password, confirmPassword }).unwrap();

            // If successful, save the email to global state and move to OTP screen
            dispatch(setRegisteredEmail(email));
            dispatch(setRegistrationStep("OTP"));
        } catch (err) {
            console.error('Registration failed: ', err);
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
                {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>Registration failed. Please check the credentials.</div>}

                <div className={styles.inputGroup}>
                    <input 
                        type="email" 
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <span className={styles.icon} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </span>
                </div>

                {password.length > 0 && (
                    <div className={styles.passwordMeter}>
                        <div className={`${styles.meterBar} ${password.length > 0 ? styles.meterBarActive : ''}`}></div>
                        <div className={`${styles.meterBar} ${password.length >= 8 ? styles.meterBarActive : ''}`}></div>
                        <div className={`${styles.meterBar} ${password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? styles.meterBarActive : ''}`}></div>
                    </div>
                )}

                <div className={styles.inputGroup}>
                    <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className={styles.input}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />
                    <span className={styles.icon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </span>
                </div>

                <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                </button>
            </form>

            <div className={styles.divider}>OR</div>

            {/* Integrated Google OAuth Button */}
            <GoogleAuthButton />

            <p className={styles.footerText}>
                Already have an account? <Link to="/login" className={styles.footerLink}>Log in.</Link>
            </p>
        </div>
    );
};