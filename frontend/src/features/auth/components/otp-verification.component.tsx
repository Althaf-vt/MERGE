import { useVerifyOtpMutation, useResendOtpMutation } from "../api/auth.api";
import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../../app/hooks";
import styles from './otp-verification.module.css';
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../../shared/utils/error.util";
import { ErrorCode } from "../../../shared/enums/ErrorCode";

export const OtpVerification = () => {
    const navigate = useNavigate();
    const email = useAppSelector((state: any) => state.auth.registeredEmail);

    const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
    const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
    
    const [clientError, setClientError] = useState<string | null>(null);
    
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(60); // 60 seconds timer
    const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Handle the countdown timer logic
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setClientError(null);
        try {
            await verifyOtp({ email, otp }).unwrap();
            navigate('/login');
        } catch (err: any) {
            console.error('OTP Verification failed: ', err);
            
            const errorCode = err?.data?.error?.code;
            if (errorCode === ErrorCode.OTP_EXPIRED) {
                setClientError("OTP Expired. Please request a new one.");
            } else if (errorCode === ErrorCode.OTP_INVALID) {
                setClientError("Invalid OTP. Please check the code and try again.");
            } else {
                setClientError(getErrorMessage(err, "OTP Verification failed."));
            }
        }
    }

    const handleResend = async () => {
        if (countdown > 0 || isResending) return;
        
        setResendMessage(null);
        try {
            await resendOtp({ email }).unwrap();
            setCountdown(60); // Reset timer on success
            setResendMessage({ type: 'success', text: 'A new code has been sent to your email.' });
        } catch (err: any) {
            setResendMessage({ type: 'error', text: getErrorMessage(err, 'Failed to resend OTP. Please try again.') });
        }
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Verify your email</h2>
            <p className={styles.subtitle}>
                We sent a 6-digit code to <br />
                <span className={styles.emailHighlight}>{email || 'your email address'}</span>
            </p>

            {resendMessage && (
                <div className={resendMessage.type === 'error' ? styles.errorText : styles.successText} style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem', color: resendMessage.type === 'error' ? '#ef4444' : '#10b981' }}>
                    {resendMessage.text}
                </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
                {clientError && <div className={styles.errorText}>{clientError}</div>}

                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        className={styles.otpInput}
                        value={otp}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setOtp(value);
                        }}
                        placeholder="000000"
                        maxLength={6}
                        autoComplete="one-time-code"
                    />
                </div>

                <button 
                    type="submit" 
                    className={styles.primaryBtn} 
                    disabled={isLoading || otp.length < 6}
                >
                    {isLoading ? "Verifying..." : "Verify Email"}
                </button>
            </form>

            <p className={styles.resendText}>
                Didn't receive the code?{' '}
                <button 
                    type="button" 
                    className={styles.resendLink} 
                    onClick={handleResend}
                    disabled={countdown > 0 || isResending}
                    style={{ opacity: countdown > 0 ? 0.5 : 1, cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
                >
                    {isResending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                </button>
            </p>
        </div>
    )
}