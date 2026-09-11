import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForgotPasswordMutation, useResetPasswordMutation } from "../api/authApi";
import styles from './LoginForm.module.css';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // UI Toggle State
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

    // Realtime password criteria verification
    const passwordChecks = {
        length: newPassword.length >= 8 && newPassword.length <= 128,
        hasUpper: /[A-Z]/.test(newPassword),
        hasLower: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword),
        noSpaces: newPassword.length > 0 && !/\s/.test(newPassword),
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

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email.trim()) return setError("Please enter your email.");

        try {
            await forgotPassword({ email: email.trim() }).unwrap();
            setStep(2);
        } catch (err: any) {
            setError(err?.data?.message || "Failed to send reset code. Try again.");
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!otp.trim() || otp.length !== 6) {
            return setError("Please enter the complete 6-digit verification code.");
        }

        if (!passwordChecks.length) {
            return setError("Password must be between 8 and 128 characters long.");
        }

        if (!passwordChecks.hasUpper) {
            return setError("Password must contain at least one uppercase letter.");
        }

        if (!passwordChecks.hasLower) {
            return setError("Password must contain at least one lowercase letter.");
        }

        if (!passwordChecks.hasNumber) {
            return setError("Password must contain at least one number.");
        }

        if (!passwordChecks.hasSpecial) {
            return setError("Password must contain at least one special character.");
        }

        if (!passwordChecks.noSpaces) {
            return setError("Password cannot contain spaces.");
        }

        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match.");
        }

        try {
            await resetPassword({ email: email.trim(), otp: otp.trim(), newPassword }).unwrap();
            navigate('/login', { replace: true });
        } catch (err: any) {
            setError(err?.data?.message || "Failed to reset password.");
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
                <h1 className={styles.title}>Reset Password</h1>
                <p className={styles.subtitle}>
                    {step === 1 ? "Enter your email to receive a code." : "Enter the code and confirm your new password."}
                </p>
            </div>

            <form className={styles.form} onSubmit={step === 1 ? handleSendCode : handleReset}>
                {error && (
                    <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
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
                ) : (
                    <>
                        <div className={styles.inputGroup}>
                            <input 
                                className={styles.input}
                                type="text" 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="6-digit Code"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <input 
                                className={styles.input}
                                type={showNewPassword ? "text" : "password"} 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password" 
                                required
                            />
                            <span className={styles.icon} onClick={() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </span>
                        </div>

                        {/* Realtime Password Strength & Rule Checklist (Compact) */}
                        {newPassword.length > 0 && (
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
                                className={styles.input}
                                type={showConfirmPassword ? "text" : "password"} 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm New Password" 
                                required
                            />
                            <span className={styles.icon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </span>
                        </div>
                    </>
                )}

                <button type="submit" className={styles.primaryBtn} disabled={isSending || isResetting}>
                    {isSending ? "Sending..." : isResetting ? "Resetting..." : step === 1 ? "Send Reset Code" : "Update Password"}
                </button>
            </form>

            <p className={styles.footerText} style={{ marginTop: '1.5rem' }}>
                Remembered it? <Link to="/login" className={styles.footerLink}>Back to Login.</Link>
            </p>
        </div>
    );
};