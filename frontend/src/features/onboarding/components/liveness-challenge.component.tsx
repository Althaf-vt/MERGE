import { useEffect, useRef, useState } from "react";
import { useSubmitLivenessMutation } from "../api/kycApi";
import styles from './liveness-challenge.module.css';

// Helper function to find the best supported video format for the current device
const getSupportedMimeType = () => {
    const types = [
        'video/webm;codecs=vp8,opus', // Preferred for Chrome/Android
        'video/webm;codecs=vp9,opus',
        'video/webm',                 // Generic fallback
        'video/mp4',                  // Preferred for iOS/Safari
    ];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return ''; // Falls back to the browser's default if none match
};

export const LivenessChallenge = ({ onSuccess }: { onSuccess: () => void }) => {
    const [submitLiveness, { isLoading }] = useSubmitLivenessMutation();
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    
    const [isRecording, setIsRecording] = useState(false);
    const [streamReady, setStreamReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Initialize Camera Stream
    useEffect(() => {
        let activeStream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false 
                });
                activeStream = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStreamReady(true);
                }
            } catch (err) {
                setError("Camera access is required for the liveness check.");
            }
        };

        startCamera();

        // Strict cleanup to turn off the camera light on unmount
        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // 2. Automated 4-Second Capture Sequence
    const startLivenessCheck = () => {
        if (!videoRef.current?.srcObject) return;
        
        setError(null);
        setIsRecording(true);
        chunksRef.current = [];

        const stream = videoRef.current.srcObject as MediaStream;
        const mimeType = getSupportedMimeType();
        
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            setIsRecording(false);
            const blob = new Blob(chunksRef.current, { type: mimeType });
            await handleSubmission(blob, mimeType);
        };

        mediaRecorder.start(200); // Collect chunks every 200ms

        // Auto-stop after exactly 4 seconds
        setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
        }, 4000);
    };

    // 3. Payload Transmission
    const handleSubmission = async (videoBlob: Blob, mimeType: string) => {
        const formData = new FormData();
        
        // Dynamically set extension so the NestJS backend knows how to handle it
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        formData.append('video', videoBlob, `liveness.${extension}`);

        try {
            const result = await submitLiveness(formData).unwrap();
            
            if (result.status === 'APPROVED') {
                onSuccess(); // Triggers Redux on Desktop, or WebSocket ping on Mobile
            } else if (result.status === 'UNDER_REVIEW') {
                setError("Verification flagged for manual review. Our team will update you shortly.");
            }
        } catch (err: any) {
            setError(err?.data?.message || "Liveness check failed. Please ensure you are in a well-lit area.");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Active Liveness Check</h2>
            <p className={styles.subtitle}>
                Hold the camera steady and look directly at the lens. 
                The recording will stop automatically.
            </p>

            {error && <div className={styles.errorText}>{error}</div>}

            <div className={styles.videoWrapper}>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`${styles.videoFeed} ${isRecording ? styles.recordingPulse : ''}`}
                />
            </div>

            <button 
                onClick={startLivenessCheck} 
                className={styles.primaryBtn} 
                disabled={!streamReady || isRecording || isLoading}
            >
                {isLoading ? "Analyzing Biometrics..." : 
                 isRecording ? "Recording..." : 
                 "Start Liveness Check"}
            </button>
        </div>
    );
};