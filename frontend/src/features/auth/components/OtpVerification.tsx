import { useVerifyOtpMutation } from "../api/authApi";
import React, { useState } from "react";
import { useAppSelector } from "../../../app/hooks";
import styles from './OtpVerification.module.css';

export const OtpVerification = () => {
    // Pull the email we just registered with from the Redux slice
    const email = useAppSelector((state: any) => state.auth.registeredEmail);

    const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
    const [otp, setOtp] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await verifyOtp({ email, otp }).unwrap();
            console.log('OTP Verified successfully!', response);

            // TODO: Save JWT token to localStorage/cookies here
            // TODO: Redirect to the KYC Onboading scree
        } catch (error) {
            console.error('OTP Verification failed: ', error);
        }
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Verify your email</h2>
            <p className={styles.subtitle}>
                We sent a 6-digit code to <br />
                <span className={styles.emailHighlight}>{email || 'your email address'}</span>
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
                
                {error && <div className={styles.errorText}>Invalid or expired code.</div>}

                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        className={styles.otpInput}
                        value={otp}
                        onChange={(e) => {
                            // Ensure only numbers are typed
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setOtp(value);
                        }}
                        placeholder="000000"
                        maxLength={6}
                        autoComplete="one-time-code" // Helps mobile devices auto-fill OTPs from SMS/Email
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
                Didn't receive the code? <button type="button" className={styles.resendLink}>Resend</button>
            </p>
        </div>
    )
}