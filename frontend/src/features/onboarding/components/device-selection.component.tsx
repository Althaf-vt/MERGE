import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks"
import { useCancelSessionMutation, useGenerateSessionMutation } from "../api/handoff.api";
import { io, type Socket } from "socket.io-client";
import { setKycStep } from "../slices/kyc.slice";
import styles from './device-selection.module.css';
import QRCode from "react-qr-code";

export const DeviceSelection = () => {
    const dispatch = useAppDispatch();
    const [generateSession, {isLoading}] = useGenerateSessionMutation();
    const [cancelSession] = useCancelSessionMutation();

    const [mode, setMode] = useState<'SELECTION' | 'QR_WAITING'>('SELECTION');
    const [sessionData, setSessionData] = useState<{id: string, url: string} | null>(null);
    const [socketStatus, setSocketStatus] = useState<string>('Waiting for phone connection...');

    useEffect(() => {
        let socket: Socket;

        if(mode === 'QR_WAITING' && sessionData){
            // Connect to the NestJs Websocket Gateway
            const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || '';
            socket = io(backendUrl, {withCredentials: true});

            // Join the private session room
            socket.emit('join-handoff-room', sessionData.id);

            // listen for real-time updates from the mobile phone
            socket.on('handoff-status-update', (data: {status: string}) => {
                if(data.status === 'PHONE_CONNECTED'){
                    setSocketStatus('Phone connected! Complete the step on your mobile screen.');
                }else if(data.status === 'COMPLETED'){
                    // Mobile finished, auto advance the desktop ui
                    dispatch(setKycStep('REVIEW_VERIFICATION'));
                }
            })
        }

        return () => {
            if(socket) socket.disconnect();
        }
    },[mode, sessionData, dispatch])

    const handleMobileSelect = async () => {
        try {
            const res = await generateSession().unwrap();
            setSessionData({id: res.data.sessionId, url: res.data.qrCodeUrl});
            setMode('QR_WAITING');
        } catch (error) {
            console.error("Failed to generate handoff session", error);
        }
    }

    const handleCancel = async() => {
        if(sessionData) await cancelSession(sessionData.id);
        setMode('SELECTION');
        setSessionData(null);
        setSocketStatus('Waiting for phone connection...');
    }

    if(mode === 'QR_WAITING' && sessionData){
        return (
        <div className={styles.qrWrapper}>
            <div className={styles.qrModal}>
                <button onClick={handleCancel} className={styles.closeBtn}>✕</button>
                <div className={styles.qrHeaderIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                </div>
                <h2 className={styles.qrTitle}>Continue Verification On Your Phone</h2>
                <p className={styles.qrSubtitle}>Scan the QR code below to continue verification using your smartphone camera.</p>
                
                <div className={styles.qrContainerWrapper}>
                    <div className={styles.qrContainer}>
                        <QRCode value={sessionData.url} size={160} />
                    </div>
                </div>
                
                <div className={styles.instructionSteps}>
                    <div className={styles.stepCard}>
                        <span className={styles.stepNumber}>1</span>
                        <p>Open your phone camera</p>
                    </div>
                    <div className={styles.stepCard}>
                        <span className={styles.stepNumber}>2</span>
                        <p>Scan the QR code</p>
                    </div>
                    <div className={styles.stepCard}>
                        <span className={styles.stepNumber}>3</span>
                        <p>Continue verification on your phone</p>
                    </div>
                </div>

                <div className={styles.statusBox}>
                    <span className={styles.pulseDot}></span>
                    {socketStatus}
                </div>
            </div>
        </div>
        );
    }

    return (
        <div className={styles.selectionWrapper}>
            <div className={styles.headerArea}>
                <h2 className={styles.title}>How would you like to complete verification?</h2>
                <p className={styles.subtitle}>Choose the camera you'd like to use for selfie and liveness verification.</p>
            </div>
        
            <div className={styles.cardsContainer}>
                {/* Desktop Option */}
                <div className={styles.deviceCard}>
                    <div className={styles.cardIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                    </div>
                    <div className={styles.cardContent}>
                        <h3>Use This Device</h3>
                        <p>Use your current camera to complete verification.</p>
                        <div className={styles.availabilityBadge}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Camera Available
                        </div>
                    </div>
                    <button onClick={() => dispatch(setKycStep('LIVE_SELFIE'))} className={styles.desktopBtn}>
                        Continue On This Device
                    </button>
                </div>

                {/* Mobile Option (Recommended) */}
                <div className={`${styles.deviceCard} ${styles.recommendedCard}`}>
                    <div className={styles.recommendedBadge}>RECOMMENDED</div>
                    <div className={styles.cardIconMobile}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    </div>
                    <div className={styles.cardContent}>
                        <h3>Use My Phone</h3>
                        <p>Continue verification using your smartphone camera for the best experience.</p>
                    </div>
                    <button onClick={handleMobileSelect} className={styles.mobileBtn} disabled={isLoading}>
                        {isLoading ? "Loading..." : "Use Phone Camera"}
                    </button>
                </div>
            </div>
        </div>
    );
}