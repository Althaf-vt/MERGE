import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRegisterUserMutation } from "../api/auth.api";
import { setRegisteredEmail, setRegistrationStep } from "../slices/auth.slice";
import { useAppDispatch } from "../../../app/hooks";
import styles from './register-form.module.css';
import { getErrorMessage } from "../../../shared/utils/error.util";
import { GoogleAuthButton } from "./google-auth.component";

export const RegisterForm = () => {
    const dispatch = useAppDispatch();

    const [register, { isLoading, error }] = useRegisterUserMutation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [clientError, setClientError] = useState<string | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordChecks = {
        length: password.length >= 8 && password.length <= 128,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
        noSpaces: password.length > 0 && !/\s/.test(password),
    };

    const passedCount = Object.values(passwordChecks).filter(Boolean).length;

    const getStrengthTier = () => {
        if (passedCount <= 2) return { text: 'Weak', className: styles.meterWeak, activeBars: 1 };
        if (passedCount <= 4) return { text: 'Fair', className: styles.meterFair, activeBars: 2 };
        if (passedCount === 5) return { text: 'Good', className: styles.meterGood, activeBars: 3 };
        return { text: 'Excellent', className: styles.meterStrong, activeBars: 4 };
    };

    const strength = getStrengthTier();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setClientError(null);

        if (!passwordChecks.length) {
            return setClientError("Password must be between 8 and 128 characters long.");
        }
        if (!passwordChecks.hasUpper) {
            return setClientError("Password must contain at least one uppercase letter.");
        }
        if (!passwordChecks.hasLower) {
            return setClientError("Password must contain at least one lowercase letter.");
        }
        if (!passwordChecks.hasNumber) {
            return setClientError("Password must contain at least one number.");
        }
        if (!passwordChecks.hasSpecial) {
            return setClientError("Password must contain at least one special character.");
        }
        if (!passwordChecks.noSpaces) {
            return setClientError("Password cannot contain spaces.");
        }
        if (password !== confirmPassword) {
            return setClientError("Passwords do not match.");
        }

        try {
            await register({ email, password, confirmPassword }).unwrap();
            dispatch(setRegisteredEmail(email));
            dispatch(setRegistrationStep("OTP"));
        } catch (err: any) {
            console.error('Registration failed: ', err);
            setClientError(getErrorMessage(err, 'Registration failed.'));
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
        <div className={styles.glassCard}>
            <div className={styles.branding}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Begin your journey to a meaningful connection.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                {clientError && <div className={styles.errorBanner}>{clientError}</div>}
                {error && <div className={styles.errorBanner}>Registration failed. Please check your credentials.</div>}

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
                    <button type="button" className={styles.iconBtn} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>

                {password.length > 0 && (
                    <div className={styles.passwordSecurityModule}>
                        <div className={styles.meterHeader}>
                            <span className={styles.meterTitle}>Security Level</span>
                            <span className={`${styles.meterLabel} ${strength.className}`}>{strength.text}</span>
                        </div>
                        
                        <div className={styles.meterBars}>
                            {[1, 2, 3, 4].map((index) => (
                                <div
                                    key={index}
                                    className={`${styles.meterSegment} ${
                                        index <= strength.activeBars ? strength.className : ''
                                    }`}
                                />
                            ))}
                        </div>

                        {passedCount < 6 && (
                            <ul className={styles.rulesList}>
                                <li className={passwordChecks.length ? styles.rulePassed : styles.rulePending}>
                                    <span className={styles.ruleIcon}>{passwordChecks.length ? '✓' : '•'}</span> 8+ chars
                                </li>
                                <li className={passwordChecks.hasUpper ? styles.rulePassed : styles.rulePending}>
                                    <span className={styles.ruleIcon}>{passwordChecks.hasUpper ? '✓' : '•'}</span> Uppercase
                                </li>
                                <li className={passwordChecks.hasLower ? styles.rulePassed : styles.rulePending}>
                                    <span className={styles.ruleIcon}>{passwordChecks.hasLower ? '✓' : '•'}</span> Lowercase
                                </li>
                                <li className={passwordChecks.hasNumber ? styles.rulePassed : styles.rulePending}>
                                    <span className={styles.ruleIcon}>{passwordChecks.hasNumber ? '✓' : '•'}</span> Number
                                </li>
                                <li className={passwordChecks.hasSpecial ? styles.rulePassed : styles.rulePending}>
                                    <span className={styles.ruleIcon}>{passwordChecks.hasSpecial ? '✓' : '•'}</span> Special
                                </li>
                                <li className={passwordChecks.noSpaces ? styles.rulePassed : styles.rulePending}>
                                    <span className={styles.ruleIcon}>{passwordChecks.noSpaces ? '✓' : '•'}</span> No spaces
                                </li>
                            </ul>
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
                    <button type="button" className={styles.iconBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>

                <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                    <span>{isLoading ? "Creating account..." : "Create Account"}</span>
                </button>
            </form>

            <div className={styles.divider}>
                <span>or</span>
            </div>

            <GoogleAuthButton />

            <p className={styles.footerText}>
                Already have an account? <Link to="/login" className={styles.footerLink}>Sign in</Link>
            </p>
        </div>
    );
};