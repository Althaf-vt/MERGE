import { useSearchParams } from "react-router-dom"
import { useAppDispatch } from "../../../app/hooks";
import { useCompleteMobileSessionMutation, useValidateMobileSessionQuery } from "../api/handoffApi";
import { useEffect, useState } from "react";
import { setCredentials } from "../../auth/slices/authSlice";
import styles from './MobileHandoff.module.css';
import { LiveSelfieCapture } from "../components/LiveSelfieCapture";

export const MobileHandoff = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const dispatch = useAppDispatch();

    const [completeMobileSession] = useCompleteMobileSessionMutation();

    // Automatically trigger the silent authentication token if a token exists
    const {data, error, isLoading} = useValidateMobileSessionQuery(token || '', {
        skip: !token,
    });

    const [authSuccess, setAuthSuccess] = useState(false);

    useEffect(() => {
        if(data?.success){
            // silently log the mobile browser in using the returned access token
            dispatch(setCredentials({accessToken: data.data.accessToken}));
            setAuthSuccess(true)
        }
    }, [data, dispatch]);

    if(!token){
        return (
            <div className={styles.wrapper}>
                <h2 className={styles.errorTitle}>Invalid Link</h2>
                <p>No session token provided. Please scan the QR code from your desktop screen again.</p>
            </div>
        )
    }

    if(isLoading){
        return(
            <div className={styles.wrapper}>
                <div className={styles.loader}></div>
                <p className={styles.loadingText}>Securing connection...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.wrapper}>
                <h2 className={styles.errorTitle}>Session Expired</h2>
                <p>This QR code has expired or is invalid. Please generate a new one on your desktop.</p>
            </div>
        );
    }

    if (authSuccess) {
        return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Connection Secure</h2>
            <p className={styles.subtitle}>Your phone is linked. We will now capture your baseline identity selfie.</p>
            
            {/* Placeholder for Phase 8: Liveness Camera Component */}
            <div className={styles.wrapper}>
                <LiveSelfieCapture onSuccess={async () => {
                // Tell the backend we are done, which pings the desktop WebSocket
                await completeMobileSession(token).unwrap();
                }} />
            </div>

            <button 
                className={styles.primaryBtn} 
                onClick={() => console.log('Transitioning to camera...')}
            >
                Start Camera
            </button>
        </div>
        );
    }

  return null;
}