import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setKycStep } from '../slices/kycSlice';
import { useSubmitFinalVerificationMutation } from '../api/kycApi';
import styles from './KycDocumentUpload.module.css'; // Reusing your existing styles

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
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Review Your Verification</h2>
            <p className={styles.subtitle}>Review your identity signals before final submission.</p>

            {error && <div className={styles.errorText}>{error}</div>}

            <div className={styles.dataCard}>
                <h3>Liveness Checks</h3>
                <ul>
                    {livenessResults.map((result, idx) => (
                        <li key={idx}>
                            {result.prompt.replace('_', ' ')}: 
                            <span style={{ color: result.completed ? 'green' : 'red', marginLeft: '8px' }}>
                                {result.completed ? 'Optimistically Verified' : 'Pending'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <input 
                    type="checkbox" 
                    id="consent" 
                    checked={consentChecked} 
                    onChange={(e) => setConsentChecked(e.target.checked)} 
                    style={{ marginRight: '10px' }}
                />
                <label htmlFor="consent" style={{ fontSize: '0.9rem', color: '#52525b' }}>
                    I confirm that the information and documents provided are accurate and belong to me.
                </label>
            </div>

            <button 
                onClick={handleSubmit} 
                className={styles.primaryBtn} 
                disabled={!consentChecked || isLoading}
            >
                {isLoading ? "Submitting..." : "Submit Verification"}
            </button>
        </div>
    );
};