import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import styles from './KycDocumentUpload.module.css';
import { setKycStep } from '../slices/kycSlice';

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
        <h2 className={styles.title}>Identity Verified</h2>
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

        <button onClick={handleContinue} className={styles.primaryBtn}>
            Continue Verification
        </button>
        </div>
    );
};