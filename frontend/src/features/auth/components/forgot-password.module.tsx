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

    const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

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

        if (newPassword.length < 8) {
            return setError("Password must be at least 8 characters long.");
        }

        if (confirmPassword.length < 8) {
            return setError("Confirm password must be at least 8 characters long.");
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

    return (
        <div className={styles.formWrapper}>
            <div className={styles.branding}>
                <h1 className={styles.title}>Reset Password</h1>
                <p className={styles.subtitle}>
                    {step === 1 ? "Enter your email to receive a code." : "Enter the code and confirm your new password."}
                </p>
            </div>

            <form onSubmit={step === 1 ? handleSendCode : handleReset}>
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
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password (min 8 chars)" 
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <input 
                                className={styles.input}
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm New Password (min 8 chars)" 
                                required
                            />
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