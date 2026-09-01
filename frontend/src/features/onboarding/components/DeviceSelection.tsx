import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks"
import { useCancelSessionMutation, useGenerateSessionMutation } from "../api/handoffApi";
import { io, type Socket } from "socket.io-client";
import { setKycStep } from "../slices/kycSlice";
import styles from './DeviceSelection.module.css';
import QRCode from "react-qr-code";

export const DeviceSelection = () => {
    const dispatch = useAppDispatch();
    const [generateSession, {isLoading}] = useGenerateSessionMutation();
    const [cancelSession] = useCancelSessionMutation();

    const [mode, setMode] = useState<'SELECTION' | 'QR_WAITING'>('SELECTION');
    const [sessionData, setSessionData] = useState<{id: string, url: string} | null>(null);
    const [socketStatus, setSocketStatus] = useState<string>('Waiting for scan...');

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
                    dispatch(setKycStep('SUCCESS'));
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
        setSocketStatus('Waiting for scan...');
    }

    if(mode === 'QR_WAITING' && sessionData){
        return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Scan with your phone</h2>
            <p className={styles.subtitle}>Open your mobile camera and scan the QR code to continue.</p>
            
            <div className={styles.qrContainer}>
            <QRCode value={sessionData.url} size={200} />
            </div>
            
            <div className={styles.statusBox}>{socketStatus}</div>
            
            <button onClick={handleCancel} className={styles.secondaryBtn}>Cancel Handoff</button>
        </div>
        );
    }

    return (
        <div className={styles.wrapper}>
        <h2 className={styles.title}>Choose your device</h2>
        <p className={styles.subtitle}>For the best biometric selfie experience, we recommend using your mobile phone camera.</p>
        
        <div className={styles.buttonGroup}>
            <button onClick={handleMobileSelect} className={styles.primaryBtn} disabled={isLoading}>
            {isLoading ? "Generating..." : "Use Mobile Phone (Recommended)"}
            </button>
            <button onClick={() => dispatch(setKycStep('LIVENESS_CHECK'))} className={styles.secondaryBtn}>
            Continue on this device
            </button>
        </div>
        </div>
    );
}