import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setKycStep, resetKyc } from '../slices/kyc.slice';
import styles from './kyc-outcome.module.css';

export const KycFailed = () => {
    const dispatch = useAppDispatch();
    
    // Attempt to dynamically fetch the rejection reason from Redux or API state, fallback to a generic message
    const errorReason = useAppSelector(state => state.kyc.extractedData?.legalName ? "Verification criteria not met" : "Document image unclear");
    const errorDetail = errorReason === "Document image unclear" 
        ? "The photo of your ID was blurry or obscured by glare. We need a clear, well-lit image where all text and your photo are easily legible to proceed."
        : "Unfortunately, our automated systems could not verify your identity with the provided information. Please ensure all documents match your real identity.";

    const handleRetry = () => {
        dispatch(resetKyc());
        dispatch(setKycStep('DOCUMENT_UPLOAD'));
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.pillBadgeError}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>Verification Failed</span>
            </div>
            
            <h1 className={styles.title}>We Couldn't Verify Your Identity.</h1>
            <p className={styles.subtitle}>Unfortunately, we were unable to complete your verification. Please review the reason below and try again.</p>

            <div className={styles.card}>
                <div className={styles.errorReasonHeader}>
                    <div className={styles.errorIconBox}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>
                    </div>
                    <div>
                        <h3 className={styles.errorTitle}>{errorReason}</h3>
                        <p className={styles.errorDescription}>{errorDetail}</p>
                    </div>
                </div>
            </div>

            <div className={styles.infoBoxGrey}>
                <h4 className={styles.tipsTitle}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Tips Before Retrying
                </h4>
                <ul className={styles.tipsList}>
                    <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Use a clearer image without glare or blur</li>
                    <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Ensure good, natural lighting</li>
                    <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Keep your face fully visible and centered</li>
                    <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Upload the correct, unexpired document</li>
                    <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete all liveness tasks carefully</li>
                </ul>
            </div>

            <div className={styles.actionGroup}>
                <button onClick={handleRetry} className={styles.primaryBtn}>Retry Verification</button>
                <button className={styles.ghostBtn}>Contact Support</button>
            </div>
        </div>
    );
};