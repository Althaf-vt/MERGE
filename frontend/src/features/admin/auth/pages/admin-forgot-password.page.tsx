import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminForgotPasswordMutation, useAdminResetPasswordMutation } from '../api/admin-auth.api';
import { getErrorMessage } from '../../../../shared/utils/error.util';
import { AdminAuthLayout } from '../components/admin-auth.layout';
import styles from './admin-forgot-password.module.css';

type Step = 'EMAIL' | 'OTP' | 'PASSWORD';

export const AdminForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('EMAIL');
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Refs for OTP auto-focus
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // API Mutations
    const [forgotPassword, { isLoading: isSending }] = useAdminForgotPasswordMutation();
    const [resetPassword, { isLoading: isResetting }] = useAdminResetPasswordMutation();

    // Password Validation Logic
    const validations = {
        hasLength: newPassword.length >= 8,
        hasUpperLower: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
        hasNumber: /\d/.test(newPassword),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    };
    const strengthScore = Object.values(validations).filter(Boolean).length;
    const strengthLabel = strengthScore === 0 ? 'None' : strengthScore <= 2 ? 'Weak' : strengthScore === 3 ? 'Good' : 'Strong';
    const strengthColor = strengthScore === 0 ? '#27272a' : strengthScore <= 2 ? '#ef4444' : strengthScore === 3 ? '#fbbf24' : '#4ade80';

    // Step 1: Request Code
    const handleRequestCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        try {
            await forgotPassword({ email }).unwrap();
            setStep('OTP');
        } catch (err: any) {
            setError(getErrorMessage(err, 'Failed to send reset code.'));
        }
    };

    // Step 2: OTP Input Handling
    const handleOtpChange = (index: number, value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (!cleaned) {
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = cleaned[cleaned.length - 1]; // take latest single digit
        setOtp(newOtp);

        if (index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Supports pasting a full 6-digit code anywhere into the OTP inputs
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pastedData) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        // Focus next unfilled box, or the last box if all 6 filled
        const focusIndex = Math.min(pastedData.length, 5);
        otpRefs.current[focusIndex]?.focus();
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.join('').length === 6) {
            setError(null);
            setStep('PASSWORD');
        } else {
            setError('Please enter the complete 6-digit code.');
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match.');
        }
        if (strengthScore < 4) {
            return setError('Please meet all password requirements.');
        }

        try {
            await resetPassword({
                email,
                otp: otp.join(''),
                newPassword
            }).unwrap();
            navigate('/admin/login', { replace: true });
        } catch (err: any) {
            const msg = getErrorMessage(err, 'Failed to reset password.');
            setError(msg);
            if (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('code')) {
                setStep('OTP');
            }
        }
    };

    const BackButton = () => (
        <button type="button" onClick={() => navigate('/admin/login')} className={styles.backBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Sign In
        </button>
    );

    return (
        <AdminAuthLayout>
            {error && <div className={styles.errorBanner}>{error}</div>}

            {/* --- STEP 1: EMAIL --- */}
            {step === 'EMAIL' && (
                <div className={styles.fadeEnter}>
                    <div className={styles.header}>
                        <h2>Forgot Password</h2>
                        <p>Enter your email address to receive a password reset verification code.</p>
                    </div>
                    <form onSubmit={handleRequestCode} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>EMAIL ADDRESS</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </span>
                                <input
                                    type="email"
                                    placeholder="admin@merge.app"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={isSending}>
                            {isSending ? 'Sending...' : 'Send Verification Code'}
                        </button>
                        <BackButton />
                    </form>
                    <div className={styles.infoBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <span>Password reset instructions will be sent to your registered administrative email address. For security reasons, verification codes expire after a limited time.</span>
                    </div>
                </div>
            )}

            {/* --- STEP 2: OTP --- */}
            {step === 'OTP' && (
                <div className={styles.fadeEnter}>
                    <div className={styles.header} style={{ textAlign: 'center' }}>
                        <div className={styles.shieldIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                        </div>
                        <h2>Verify Your Identity</h2>
                        <p>Enter the 6-digit verification code sent to your registered email address.</p>
                        <div className={styles.emailBadge}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            {email}
                        </div>
                    </div>
                    <form onSubmit={handleVerifyOtp} className={styles.form}>
                        <div className={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { otpRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className={styles.otpInput}
                                    required
                                />
                            ))}
                        </div>
                        <div className={styles.otpActions}>
                            <div className={styles.timer}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                10:00
                            </div>
                            <span className={styles.textLink} onClick={() => handleRequestCode()}>Resend Code</span>
                            <span className={styles.textLink} onClick={() => setStep('EMAIL')}>Change Email</span>
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            Verify Code →
                        </button>
                        <BackButton />
                    </form>
                    <div className={styles.infoBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <span>For security reasons, verification codes expire after a short period and can only be used once. Do not share this code with anyone.</span>
                    </div>
                </div>
            )}

            {/* --- STEP 3: NEW PASSWORD --- */}
            {step === 'PASSWORD' && (
                <div className={styles.fadeEnter}>
                    <div className={styles.header}>
                        <h2>Create New Password</h2>
                        <p>Choose a strong password to secure your administrative account.</p>
                    </div>
                    <form onSubmit={handleResetPassword} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>NEW PASSWORD</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ paddingLeft: '1rem' }}
                                    required
                                />
                                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>CONFIRM PASSWORD</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ paddingLeft: '1rem' }}
                                    required
                                />
                                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className={styles.strengthModule}>
                            <div className={styles.strengthHeader}>
                                <span>PASSWORD STRENGTH</span>
                                <span style={{ color: strengthColor }}>{strengthLabel}</span>
                            </div>
                            <div className={styles.strengthBars}>
                                {[0, 1, 2, 3].map((index) => (
                                    <div 
                                        key={index} 
                                        className={styles.strengthSegment} 
                                        style={{ backgroundColor: index < strengthScore ? strengthColor : '#27272a' }}
                                    />
                                ))}
                            </div>
                        </div>

                        <ul className={styles.checklist}>
                            <li className={validations.hasLength ? styles.validItem : ''}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> 8+ characters
                            </li>
                            <li className={validations.hasUpperLower ? styles.validItem : ''}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Uppercase & lowercase
                            </li>
                            <li className={validations.hasNumber ? styles.validItem : ''}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> At least one number
                            </li>
                            <li className={validations.hasSpecial ? styles.validItem : ''}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Special character
                            </li>
                        </ul>

                        <button type="submit" className={styles.submitBtn} disabled={isResetting}>
                            {isResetting ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <BackButton />
                    </form>
                </div>
            )}
        </AdminAuthLayout>
    );
};