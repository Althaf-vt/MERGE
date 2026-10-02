import React, { useState, useEffect } from 'react';
import { useRequestSecurityOtpMutation, useUpdateSecurityPasswordMutation } from '../api/profile.api';
import styles from './security-modals.module.css';

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Used to dispatch logout() to kill the frontend session
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [requestOtp] = useRequestSecurityOtpMutation();
    const [updatePassword, { isLoading }] = useUpdateSecurityPasswordMutation();

    const [step, setStep] = useState<1 | 2>(1);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    const [timeLeft, setTimeLeft] = useState(60);

    // Trigger OTP send on mount
    useEffect(() => {
        if (isOpen) {
            handleRequestOtp();
            setStep(1);
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [isOpen]);

    // Timer countdown logic
    useEffect(() => {
        if (!isOpen || timeLeft <= 0) return;
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [isOpen, timeLeft]);

    const handleRequestOtp = async () => {
        try {
            await requestOtp().unwrap();
            setTimeLeft(60);
            setError('');
        } catch (err: any) {
            setError('Failed to send verification code. Please try again.');
        }
    };

    const calculateStrength = (pass: string) => {
        let score = 0;
        if (!pass) return score;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score; // 0 to 4
    };

    const strength = calculateStrength(newPassword);
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const strengthColors = ['#e5e7eb', '#ef4444', '#f59e0b', '#10b981', '#059669'];

    const handleNext = () => {
        if (otp.trim().length !== 6) {
            setError('Please enter a valid 6-digit verification code.');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleSubmit = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (strength < 3) {
            setError('Please choose a stronger password.');
            return;
        }

        setError('');
        try {
            await updatePassword({ otp, newPassword, confirmPassword }).unwrap();
            onSuccess(); // Triggers frontend logout
        } catch (err: any) {
            const apiMessage = err?.data?.message;
            if (Array.isArray(apiMessage)) setError(apiMessage.join(' • '));
            else if (typeof apiMessage === 'string') setError(apiMessage);
            else setError('Failed to update password.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.iconWrapper}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h3 className={styles.title}>Update Password</h3>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                {step === 1 ? (
                    <>
                        <p className={styles.description}>We've sent a 6-digit verification code to your registered email address to authorize this change.</p>
                        <div className={styles.inputGroup}>
                            <label>Verification Code</label>
                            <input 
                                className={`${styles.input} ${styles.otpInput}`}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="------"
                            />
                        </div>
                        <div className={styles.timerRow}>
                            <span style={{ color: '#6b7280' }}>
                                {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Did not receive code?'}
                            </span>
                            <button type="button" className={styles.resendBtn} disabled={timeLeft > 0} onClick={handleRequestOtp}>
                                Resend Code
                            </button>
                        </div>
                        <div className={styles.actionRow}>
                            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancel</button>
                            <button type="button" className={styles.btnPrimary} onClick={handleNext}>Next →</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.inputGroup}>
                            <label>New Password</label>
                            <input 
                                type="password"
                                className={styles.input}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                            <div className={styles.strengthMeter}>
                                {[1, 2, 3, 4].map(level => (
                                    <div 
                                        key={level} 
                                        className={styles.strengthBar}
                                        style={{ backgroundColor: strength >= level ? strengthColors[strength] : '#e5e7eb' }}
                                    />
                                ))}
                            </div>
                            <div className={styles.strengthText} style={{ color: strength > 0 ? strengthColors[strength] : '#6b7280' }}>
                                {newPassword ? strengthLabels[strength] : 'Enter a password'}
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Confirm Password</label>
                            <input 
                                type="password"
                                className={styles.input}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <div className={styles.actionRow}>
                            <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)}>← Back</button>
                            <button type="button" className={styles.btnPrimary} onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Password'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};