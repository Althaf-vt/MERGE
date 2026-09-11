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

    // Realtime password criteria verification
    const passwordChecks = {
        length: password.length >= 8 && password.length <= 128,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
        noSpaces: password.length > 0 && !/\s/.test(password),
    };

    const passedCount = Object.values(passwordChecks).filter(Boolean).length;

    // Strength tier calculations
    const getStrengthTier = () => {
        if (passedCount <= 2) return { text: 'Weak', className: styles.meterWeak, color: '#ef4444', activeBars: 1 };
        if (passedCount <= 4) return { text: 'Fair', className: styles.meterFair, color: '#f59e0b', activeBars: 2 };
        if (passedCount === 5) return { text: 'Good', className: styles.meterGood, color: '#3b82f6', activeBars: 3 };
        return { text: 'Strong', className: styles.meterStrong, color: '#10b981', activeBars: 4 };
    };

    const strength = getStrengthTier();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setClientError(null);

        if (!passwordChecks.length) {
            setClientError("Password must be between 8 and 128 characters long");
            return;
        }

        if (!passwordChecks.hasUpper) {
            setClientError("Password must contain at least one uppercase letter");
            return;
        }

        if (!passwordChecks.hasLower) {
            setClientError("Password must contain at least one lowercase letter");
            return;
        }

        if (!passwordChecks.hasNumber) {
            setClientError("Password must contain at least one number");
            return;
        }

        if (!passwordChecks.hasSpecial) {
            setClientError("Password must contain at least one special character");
            return;
        }

        if (!passwordChecks.noSpaces) {
            setClientError("Password cannot contain spaces");
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
        } catch (err: any) {
            console.error('Registration failed: ', err);
            setClientError(err?.data?.message || 'Registration failed');
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

                {/* Realtime Password Strength & Rule Checklist (Compact) */}
                {password.length > 0 && (
                    <div className={styles.passwordMeterContainer}>
                        <div className={styles.meterRow}>
                            <div className={styles.passwordMeter}>
                                {[1, 2, 3, 4].map((index) => (
                                    <div
                                        key={index}
                                        className={`${styles.meterBar} ${
                                            index <= strength.activeBars ? strength.className : ''
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className={styles.meterLabel} style={{ color: strength.color }}>
                                {strength.text}
                            </span>
                        </div>

                        {/* Collapses once all conditions are satisfied */}
                        {passedCount < 6 && (
                            <div className={styles.rulesList}>
                                <span className={`${styles.ruleItem} ${passwordChecks.length ? styles.rulePassed : ''}`}>
                                    <span className={styles.ruleIcon}>{passwordChecks.length ? '✓' : '•'}</span> 8+ chars
                                </span>
                                <span className={`${styles.ruleItem} ${passwordChecks.hasUpper ? styles.rulePassed : ''}`}>
                                    <span className={styles.ruleIcon}>{passwordChecks.hasUpper ? '✓' : '•'}</span> 1 uppercase
                                </span>
                                <span className={`${styles.ruleItem} ${passwordChecks.hasLower ? styles.rulePassed : ''}`}>
                                    <span className={styles.ruleIcon}>{passwordChecks.hasLower ? '✓' : '•'}</span> 1 lowercase
                                </span>
                                <span className={`${styles.ruleItem} ${passwordChecks.hasNumber ? styles.rulePassed : ''}`}>
                                    <span className={styles.ruleIcon}>{passwordChecks.hasNumber ? '✓' : '•'}</span> 1 number
                                </span>
                                <span className={`${styles.ruleItem} ${passwordChecks.hasSpecial ? styles.rulePassed : ''}`}>
                                    <span className={styles.ruleIcon}>{passwordChecks.hasSpecial ? '✓' : '•'}</span> 1 symbol
                                </span>
                                <span className={`${styles.ruleItem} ${passwordChecks.noSpaces ? styles.rulePassed : ''}`}>
                                    <span className={styles.ruleIcon}>{passwordChecks.noSpaces ? '✓' : '•'}</span> no spaces
                                </span>
                            </div>
                        )}
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