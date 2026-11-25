import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateUser } from '../../auth/slices/auth.slice';
import { useResetKycResubmissionMutation } from '../api/kyc.api';
import styles from './kyc-resubmission-pending.module.css';

const REASON_LABELS: Record<string, string> = {
    UPLOAD_CORRECT_DOCUMENT: 'Upload Correct Document',
    COUNTRY_SELECTION_CORRECTION: 'Country Selection Correction',
    RETAKE_SELFIE: 'Retake Live Selfie',
    RETRY_LIVENESS_VERIFICATION: 'Retry Liveness Verification',
    OTHER: 'Other Verification Issue',
};

export const KycResubmissionPending: React.FC = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [resetKyc, { isLoading }] = useResetKycResubmissionMutation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const kyc = user?.kycVerification;
    const reasons = kyc?.resubmissionReasons || [];
    const reviewerMessage = kyc?.resubmissionMessage;

    // Detect which pillars require action
    const hasDocIssue = reasons.some(
        (r) => r === 'UPLOAD_CORRECT_DOCUMENT' || r === 'COUNTRY_SELECTION_CORRECTION'
    );
    const hasBiometricIssue = reasons.some(
        (r) => r === 'RETAKE_SELFIE' || r === 'RETRY_LIVENESS_VERIFICATION'
    );
    const isBothOrGeneral =
        (hasDocIssue && hasBiometricIssue) ||
        reasons.includes('OTHER') ||
        (!hasDocIssue && !hasBiometricIssue);

    // Pillar statuses
    const isDocReset = hasDocIssue || isBothOrGeneral;
    const isBiometricReset = hasBiometricIssue || isBothOrGeneral;

    const handleProceed = async () => {
        try {
            setErrorMessage(null);
            const response = await resetKyc().unwrap();
            if (response.data) {
                dispatch(updateUser(response.data));
            }
        } catch (err: unknown) {
            const apiError = err as { data?: { message?: string }; message?: string };
            setErrorMessage(
                apiError.data?.message || apiError.message || 'Failed to reset verification. Please try again.'
            );
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.topIconCircle}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>

            <div className={styles.pillBadgeWarning}>
                <div className={styles.warningDot} />
                <span>Changes Requested by Reviewer</span>
            </div>

            <h1 className={styles.title}>Update Required</h1>
            <p className={styles.subtitle}>
                Our verification team reviewed your submission and requested adjustments to ensure your account meets security standards.
            </p>

            {/* Reviewer Note Callout */}
            {reviewerMessage && (
                <div className={styles.reviewerCallout}>
                    <div className={styles.reviewerCalloutHeader}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Note from Specialist</span>
                    </div>
                    <p className={styles.reviewerMessageText}>"{reviewerMessage}"</p>
                </div>
            )}

            {/* Reason Tags */}
            {reasons.length > 0 && (
                <div className={styles.reasonsContainer}>
                    {reasons.map((reason) => (
                        <span key={reason} className={styles.reasonTag}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {REASON_LABELS[reason] || reason}
                        </span>
                    ))}
                </div>
            )}

            {/* Two-Pillar Status Overview */}
            <div className={styles.pillarsGrid}>
                {/* Pillar 1: Government Document */}
                <div className={`${styles.pillarCard} ${isDocReset ? styles.pillarCardReset : styles.pillarCardPreserved}`}>
                    <div className={`${styles.pillarIconCircle} ${isDocReset ? styles.iconCircleAmber : styles.iconCircleGreen}`}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <h3 className={styles.pillarTitle}>Government ID</h3>
                    <p className={styles.pillarSubtitle}>Digital Aadhaar / PKI Identity Document</p>
                    <span className={`${styles.statusBadge} ${isDocReset ? styles.badgeNeedsAction : styles.badgePreserved}`}>
                        {isDocReset ? (
                            <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /></svg>
                                Action Needed
                            </>
                        ) : (
                            <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                Approved & Preserved
                            </>
                        )}
                    </span>
                </div>

                {/* Pillar 2: Biometrics */}
                <div className={`${styles.pillarCard} ${isBiometricReset ? styles.pillarCardReset : styles.pillarCardPreserved}`}>
                    <div className={`${styles.pillarIconCircle} ${isBiometricReset ? styles.iconCircleAmber : styles.iconCircleGreen}`}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                    </div>
                    <h3 className={styles.pillarTitle}>Biometric Verification</h3>
                    <p className={styles.pillarSubtitle}>Live Selfie & Liveness Challenges</p>
                    <span className={`${styles.statusBadge} ${isBiometricReset ? styles.badgeNeedsAction : styles.badgePreserved}`}>
                        {isBiometricReset ? (
                            <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /></svg>
                                Action Needed
                            </>
                        ) : (
                            <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                Approved & Preserved
                            </>
                        )}
                    </span>
                </div>
            </div>

            {/* Contextual Guidance Box */}
            <div className={styles.guidanceBox}>
                <div className={styles.guidanceIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                </div>
                <p className={styles.guidanceText}>
                    {!isBothOrGeneral && !isDocReset ? (
                        <>
                            <strong>Your government document is approved and preserved.</strong> You only need to retake your live selfie and complete the liveness challenges.
                        </>
                    ) : !isBothOrGeneral && !isBiometricReset ? (
                        <>
                            <strong>Your selfie and liveness verification are approved.</strong> You only need to re-upload your valid government document.
                        </>
                    ) : (
                        <>
                            <strong>Both pillars require your attention.</strong> Please re-upload your document and retake your biometric verification as instructed.
                        </>
                    )}
                </p>
            </div>

            {errorMessage && (
                <div className={styles.errorAlert}>
                    {errorMessage}
                </div>
            )}

            {/* Actions */}
            <div className={styles.actionGroup}>
                <button
                    onClick={handleProceed}
                    disabled={isLoading}
                    className={styles.primaryBtn}
                >
                    {isLoading ? (
                        <>
                            <div className={styles.spinner} />
                            <span>Resetting Verification...</span>
                        </>
                    ) : (
                        <>
                            <span>Proceed to Update Verification</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
