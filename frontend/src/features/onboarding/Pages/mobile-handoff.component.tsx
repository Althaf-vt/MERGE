import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { setCredentials } from "../../auth/slices/authSlice";
import { useCompleteMobileSessionMutation, useValidateMobileSessionQuery } from "../api/handoffApi";

import { LiveSelfieCapture } from "../components/LiveSelfieCapture"; // Update import if renamed
import { LivenessChallenge } from "../components/liveness-challenge.component";
import styles from './mobile-handoff.module.css'; // Update import if CSS file is renamed

// 1. Local progression tracking strictly for the mobile device's internal flow
type MobileBiometricStep = 'SELFIE' | 'LIVENESS' | 'DONE';

export const MobileHandoff = () => {
    // 2. Extract the temporary session token from the QR Code URL
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const dispatch = useAppDispatch();

    // 3. RTK Query Hooks for backend communication
    const [completeMobileSession] = useCompleteMobileSessionMutation();
    
    // Automatically trigger the silent authentication if a token exists in the URL
    const { data, error, isLoading } = useValidateMobileSessionQuery(token || '', {
        skip: !token, // Prevent firing if the user navigates here without a token
    });

    // 4. Local State Management
    const [authSuccess, setAuthSuccess] = useState(false);
    const [mobileStep, setMobileStep] = useState<MobileBiometricStep>('SELFIE');

    // 5. Silent Authentication Synchronization
    // Once the token is validated, we securely lock the mobile browser into the user's session
    useEffect(() => {
        if (data?.success) {
            dispatch(setCredentials({ accessToken: data.data.accessToken }));
            setAuthSuccess(true);
        }
    }, [data, dispatch]);

    // 6. Final Sequence Handler
    // Triggered only when BOTH the Selfie and Liveness steps are successfully completed
    const handleFinalCompletion = async () => {
        setMobileStep('DONE');
        if (token) {
            // This API call hits the NestJS backend, which then destroys the Redis session
            // and emits a WebSocket ping to the Desktop browser to auto-redirect it to SUCCESS.
            await completeMobileSession(token).unwrap();
        }
    };

    // 7. Guard Clauses: Handle missing tokens, loading states, and expired sessions immediately
    if (!token) {
        return (
            <div className={styles.wrapper}>
                <h2>Invalid Link</h2>
                <p>No session token provided. Please scan the QR code from your desktop screen again.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.loader}></div>
                <p>Securing connection...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.wrapper}>
                <h2>Session Expired</h2>
                <p>This QR code has expired or is invalid. Please generate a new one on your desktop.</p>
            </div>
        );
    }

    // 8. Main Biometric Pipeline Render
    // Only renders if the mobile browser is fully authenticated
    if (authSuccess) {
        return (
            <div className={styles.wrapper}>
                
                {/* Step A: Live Selfie Capture */}
                {mobileStep === 'SELFIE' && (
                    <>
                        <h2 className={styles.title}>Baseline Identity</h2>
                        <p className={styles.subtitle}>Take a clear selfie to establish your baseline identity.</p>
                        
                        {/* On success, automatically advance to the Liveness Check */}
                        <LiveSelfieCapture onSuccess={() => setMobileStep('LIVENESS')} />
                    </>
                )}

                {/* Step B: Active Liveness Challenge */}
                {mobileStep === 'LIVENESS' && (
                    <>
                        <h2 className={styles.title}>Liveness Challenge</h2>
                        <p className={styles.subtitle}>Hold steady to verify you are a live human.</p>
                        
                        {/* On success, trigger the final handoff completion sequence */}
                        <LivenessChallenge onSuccess={handleFinalCompletion} />
                    </>
                )}

                {/* Step C: Terminal State */}
                {mobileStep === 'DONE' && (
                    <>
                        <h2 className={styles.title}>Verification Complete</h2>
                        <p className={styles.subtitle}>You may now close this window and return to your desktop screen.</p>
                    </>
                )}
            </div>
        );
    }

    // Fallback render (should ideally never be reached)
    return null;
};