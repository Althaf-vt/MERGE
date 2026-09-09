import { useNavigate } from 'react-router-dom';
import styles from './KycOutcome.module.css';

export const KycUnderReview = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.wrapper}>
            <div className={styles.topIconCircle}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="12" cy="14" r="3"></circle><path d="M12 12v2l1.5 1.5"></path></svg>
            </div>
            <div className={styles.pillBadgeNeutral}>
                <div className={styles.statusDot}></div>
                <span>MANUAL REVIEW REQUIRED</span>
            </div>
            
            <h1 className={styles.title}>Verification Under Review</h1>
            <p className={styles.subtitle}>Your verification has been submitted successfully. Our team needs a little more time to review your information.</p>

            <div className={styles.card}>
                <ul className={styles.stepperList}>
                    <li>
                        <div className={styles.stepperIconDone}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span>Document Received</span>
                    </li>
                    <li>
                        <div className={styles.stepperIconDone}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span>Selfie Received</span>
                    </li>
                    <li>
                        <div className={styles.stepperIconDone}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span>Liveness Check Completed</span>
                    </li>
                </ul>
                <div className={styles.divider}></div>
                <div className={styles.awaitingReview}>
                    <div className={styles.hourglassIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M8 2h8"></path><path d="M8 22h8"></path><path d="M12 2c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.1V15c-1.8 1-3 2.9-3 5.1 0 3.3 2.7 6 6 6s6-2.7 6-6c0-2.2-1.2-4.1-3-5.1v-1.9c1.8-1 3-2.9 3-5.1 0-3.3-2.7-6-6-6z"></path></svg>
                    </div>
                    <div>
                        <h4>Awaiting Manual Review</h4>
                        <p>A specialist is currently assigned to your case.</p>
                    </div>
                </div>
            </div>

            <div className={styles.infoBoxPurple}>
                <div className={styles.infoIconBox}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <div className={styles.infoContent}>
                    <h4>What Happens Next?</h4>
                    <p>Our verification specialists are reviewing your submission to ensure the highest safety standards for our community.</p>
                    <div className={styles.estimatedTime}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Estimated Review Time: 24-48 Hours
                    </div>
                    <p className={styles.notificationNote}>You will receive a notification via email and push once the review is complete.</p>
                </div>
            </div>

            <div className={styles.actionGroup}>
                <button onClick={() => navigate('/dashboard')} className={styles.primaryBtn}>
                    Go To Dashboard <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
                <button className={styles.ghostBtnPurple}>Check Verification Status</button>
            </div>
        </div>
    );
};