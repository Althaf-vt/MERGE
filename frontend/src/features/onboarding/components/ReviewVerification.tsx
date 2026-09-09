import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setKycStep } from '../slices/kycSlice';
import { useSubmitFinalVerificationMutation } from '../api/kycApi';
import styles from './ReviewVerification.module.css'; 

export const ReviewVerification = () => {
    const dispatch = useAppDispatch();
    const livenessResults = useAppSelector(state => state.kyc.livenessResults);
    
    const [submitFinalVerification, { isLoading }] = useSubmitFinalVerificationMutation();
    const [consentChecked, setConsentChecked] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!consentChecked) return;
        
        try {
            const res = await submitFinalVerification().unwrap();
            
            if (res.status === 'APPROVED' || res.status === 'UNDER_REVIEW') {
                dispatch(setKycStep('SUCCESS'));
            } else {
                setError("Verification failed. Please restart the process.");
            }
        } catch (err: any) {
            setError(err?.data?.message || "Failed to submit verification.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <div className={styles.stepIndicator}>
                    <span>Step 4 of 5</span>
                    <span>Review</span>
                </div>
                <h1 className={styles.mainTitle}>Review Your Verification</h1>
                <p className={styles.subtitle}>Please review your information before submitting. Once submitted, our verification system will begin processing your identity check.</p>

                {error && <div className={styles.errorText}>{error}</div>}

                <div className={styles.checklistCard}>
                    <div className={styles.checklistItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#22c55e" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>
                        <span>Document Uploaded</span>
                    </div>
                    <div className={styles.checklistItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#22c55e" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>
                        <span>Selfie Captured</span>
                    </div>
                    <div className={styles.checklistItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#22c55e" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>
                        <span>Liveness Verification Passed</span>
                    </div>
                </div>

                <div className={styles.securityCard}>
                    <div className={styles.securityHeader}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#eab308" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <h3>Your Information Is Protected</h3>
                    </div>
                    <ul className={styles.securityList}>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Encrypted Storage</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> Private Verification</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> Safer Community</li>
                    </ul>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.summaryCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardEyebrow}>IDENTITY DOCUMENT</span>
                        <div className={styles.headerActions}>
                            <button className={styles.textBtn}>View Full Size</button>
                            <button className={styles.textBtn}>Replace</button>
                        </div>
                    </div>
                    <h3 className={styles.docTypeTitle}>Cryptographic e-KYC</h3>
                    <p className={styles.docSubtitle}>Verified successfully</p>
                    <div className={styles.docPlaceholder}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                </div>

                <div className={styles.summaryCardSmall}>
                    <div className={styles.selfieContent}>
                        <div className={styles.selfieAvatar}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div className={styles.selfieText}>
                            <span className={styles.cardEyebrow}>SELFIE VERIFICATION</span>
                            <span className={styles.successText}><svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg> Selfie Captured Successfully</span>
                        </div>
                    </div>
                    <button className={styles.textBtn}>Retake</button>
                </div>

                <div className={styles.summaryCardSmall}>
                    <div className={styles.livenessHeader}>
                        <span className={styles.cardEyebrow}>LIVENESS VERIFICATION</span>
                        <span className={styles.badgeSuccess}>Passed</span>
                    </div>
                    <div className={styles.livenessGrid}>
                        {livenessResults.map((result, idx) => (
                            <div key={idx} className={styles.livenessItem}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>{result.prompt.replace('_', ' ')} Verified</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.consentCard}>
                    <label className={styles.checkboxLabel}>
                        <input 
                            type="checkbox" 
                            checked={consentChecked} 
                            onChange={(e) => setConsentChecked(e.target.checked)} 
                            className={styles.checkbox}
                        />
                        <span>I confirm that the information and documents provided are accurate and belong to me.</span>
                    </label>
                </div>

                <div className={styles.infoBanner}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <span>Once submitted, your verification will be processed automatically. Some submissions may require additional manual review.</span>
                </div>

                <div className={styles.actionFooter}>
                    <button className={styles.backBtn}>Back</button>
                    <button onClick={handleSubmit} className={styles.primaryBtn} disabled={!consentChecked || isLoading}>
                        {isLoading ? "Submitting..." : "Submit Verification →"}
                    </button>
                </div>
            </div>
        </div>
    );
};