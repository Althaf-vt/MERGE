import { useNavigate } from 'react-router-dom';
import styles from './kyc-outcome.module.css';

export const KycVerified = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.wrapper}>
            <div className={styles.pillBadgeSuccess}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#6200ea" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>
                <span>Verification Complete</span>
            </div>
            
            <h1 className={styles.title}>Identity Verified</h1>
            <p className={styles.subtitle}>Your identity has been successfully verified. You can now continue building your MERGE profile and begin your journey.</p>

            <div className={styles.card}>
                <ul className={styles.checklist}>
                    <li>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#6200ea" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>
                        Document Verified
                    </li>
                    <li>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#6200ea" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>
                        Face Match Passed
                    </li>
                    <li>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#6200ea" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>
                        Liveness Verification Passed
                    </li>
                    <li>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#6200ea" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="9 12 11 14 15 10"></polyline></svg>
                        Security Checks Passed
                    </li>
                </ul>
            </div>

            <div className={styles.infoBoxGrey}>
                <p>Your profile is now eligible to continue onboarding. We're excited to help you create meaningful connections.</p>
            </div>

            <div className={styles.actionGroup}>
                <button onClick={() => navigate('/onboarding/profile')} className={styles.primaryBtn}>
                    Build Your Persona <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
                <button className={styles.ghostBtn}>View Verification Details</button>
            </div>
        </div>
    );
};