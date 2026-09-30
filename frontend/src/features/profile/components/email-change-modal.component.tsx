import React, { useState, useEffect } from 'react';
import { useRequestSecurityOtpMutation, useInitiateEmailChangeMutation, useConfirmEmailChangeMutation } from '../api/profile.api';
import styles from './security-modals.module.css';

interface EmailChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Dispatches logout() on completion
}

export const EmailChangeModal: React.FC<EmailChangeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [requestOtp] = useRequestSecurityOtpMutation();
    const [initiateChange, { isLoading: isInitiating }] = useInitiateEmailChangeMutation();
    const [confirmChange, { isLoading: isConfirming }] = useConfirmEmailChangeMutation();

    const [step, setStep] = useState<1 | 2>(1);
    const [currentOtp, setCurrentOtp] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newEmailOtp, setNewEmailOtp] = useState('');
    const [error, setError] = useState('');
    
    const [timeLeft, setTimeLeft] = useState(60);

    // Request initial OTP on mount
    useEffect(() => {
        if (isOpen) {
            handleRequestOtp();
            setStep(1);
            setCurrentOtp('');
            setNewEmail('');
            setNewEmailOtp('');
            setError('');
        }
    }, [isOpen]);

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
        } catch (err) {
            setError('Failed to request verification code.');
        }
    };

    const handleInitiate = async () => {
        setError('');
        try {
            await initiateChange({ currentOtp, newEmail }).unwrap();
            setStep(2);
            setTimeLeft(60); // Restart timer for the second OTP sent to the NEW email
        } catch (err: any) {
            const apiMessage = err?.data?.message;
            if (Array.isArray(apiMessage)) setError(apiMessage.join(' • '));
            else if (typeof apiMessage === 'string') setError(apiMessage);
            else setError('Failed to verify current email.');
        }
    };

    const handleConfirm = async () => {
        setError('');
        try {
            await confirmChange({ newEmailOtp }).unwrap();
            onSuccess(); // Log out user to force login with new email
        } catch (err: any) {
            const apiMessage = err?.data?.message;
            if (Array.isArray(apiMessage)) setError(apiMessage.join(' • '));
            else if (typeof apiMessage === 'string') setError(apiMessage);
            else setError('Failed to verify new email address.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.iconWrapper}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <h3 className={styles.title}>Update Email Address</h3>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                {step === 1 ? (
                    <>
                        <p className={styles.description}>Verify ownership of your account using the code sent to your current email.</p>
                        <div className={styles.inputGroup}>
                            <label>Current Email Verification Code</label>
                            <input 
                                className={`${styles.input} ${styles.otpInput}`}
                                value={currentOtp}
                                onChange={(e) => setCurrentOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                        <div className={styles.inputGroup}>
                            <label>New Email Address</label>
                            <input 
                                type="email"
                                className={styles.input}
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className={styles.actionRow}>
                            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isInitiating}>Cancel</button>
                            <button type="button" className={styles.btnPrimary} onClick={handleInitiate} disabled={isInitiating}>
                                {isInitiating ? 'Verifying...' : 'Next →'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className={styles.description}>We've sent a new verification code to <strong>{newEmail}</strong>. Enter it below to confirm the change.</p>
                        <div className={styles.inputGroup}>
                            <label>New Email Verification Code</label>
                            <input 
                                className={`${styles.input} ${styles.otpInput}`}
                                value={newEmailOtp}
                                onChange={(e) => setNewEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="------"
                            />
                        </div>
                        <div className={styles.actionRow}>
                            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isConfirming}>Cancel</button>
                            <button type="button" className={styles.btnPrimary} onClick={handleConfirm} disabled={isConfirming}>
                                {isConfirming ? 'Confirming...' : 'Update Email'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};