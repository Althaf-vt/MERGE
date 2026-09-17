import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import styles from './kyc-outcome.module.css';
import { setKycStep } from '../slices/kyc.slice';

export const KycSuccess = () => {
    const dispatch = useAppDispatch();
    
    // Retrieve the democraphic data we saved to Redux during the PKI upload
    const extractedData = useAppSelector((state) => state.kyc.extractedData);

    const handleContinue = () => {
        // Advance to device selection on desktop
        dispatch(setKycStep('DEVICE_SELECTION'));
    };

    // Fallback in case the component renders before data is available
    if (!extractedData) {
        return <div className={styles.wrapper}>Loading verified data...</div>;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.pillBadgeSuccess}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#6D28D9" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>
                <span>Document Verified</span>
            </div>

            <h2 className={styles.title}>Identity Extracted</h2>
            <p className={styles.subtitle}>
                Your cryptographic signature is valid. We have successfully extracted your demographic data.
            </p>
            
            <div className={styles.dataCard}>
                <p><strong>Legal Name:</strong> {extractedData.legalName}</p>
                <p>
                <strong>Date of Birth:</strong>{' '}
                {new Date(extractedData.dateOfBirth).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
                </p>
            </div>

            <div className={styles.actionGroup}>
                <button onClick={handleContinue} className={styles.primaryBtn}>
                    <span>Continue Verification</span>
                </button>
            </div>
        </div>
    );
};