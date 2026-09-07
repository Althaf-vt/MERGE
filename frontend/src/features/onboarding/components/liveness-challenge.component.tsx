import { useEffect, useRef, useState } from "react";
import { useSubmitLivenessMutation } from "../api/kycApi";
import { useAppDispatch } from "../../../app/hooks";
import { addLivenessResult } from "../slices/kycSlice";
import styles from './liveness-challenge.module.css';

const getSupportedMimeType = () => {
    const types = ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'video/webm';
};

const LIVENESS_PROMPTS = [
    { id: 'BLINK', label: 'Blink Eyes' },
    { id: 'TURN_LEFT', label: 'Turn Head Left' },
    { id: 'TURN_RIGHT', label: 'Turn Head Right' },
    { id: 'SMILE', label: 'Smile Naturally' },
    { id: 'NOD', label: 'Nod Slightly' }
];

export const LivenessChallenge = ({ onSuccess }: { onSuccess: () => void }) => {
    const dispatch = useAppDispatch();
    const [submitLiveness] = useSubmitLivenessMutation();
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streamReady, setStreamReady] = useState(false);
    
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        let isMounted = true;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false 
                });
                
                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                activeStream = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().then(() => setStreamReady(true));
                    };
                }
            } catch (err) {
                setError("Camera access is required. Please allow permission.");
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecordingPrompt = () => {
        if (!videoRef.current?.srcObject) return;
        
        setError(null);
        setIsRecording(true);
        const chunks: BlobPart[] = [];
        
        const stream = videoRef.current.srcObject as MediaStream;
        const mimeType = getSupportedMimeType();
        const mediaRecorder = new MediaRecorder(stream, { mimeType });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            setIsRecording(false);
            const blob = new Blob(chunks, { type: mimeType });
            await handlePromptSubmission(blob, mimeType, LIVENESS_PROMPTS[currentPromptIndex].id);
        };

        mediaRecorder.start(200);

        setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        }, 3000);
    };

    const handlePromptSubmission = async (videoBlob: Blob, mimeType: string, promptType: string) => {
        const formData = new FormData();
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        formData.append('video', videoBlob, `liveness.${extension}`);
        formData.append('promptType', promptType);

        try {
            dispatch(addLivenessResult({ prompt: promptType, completed: true }));
            await submitLiveness(formData).unwrap();
            
            if (currentPromptIndex + 1 < LIVENESS_PROMPTS.length) {
                setCurrentPromptIndex(prev => prev + 1);
            } else {
                onSuccess(); 
            }
        } catch (err: any) {
            const rawError = err?.data?.message || err?.data?.detail;
            const errorMsg = typeof rawError === 'string' ? rawError : "Liveness check failed. Please try again.";
            setError(errorMsg);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <h1 className={styles.mainTitle}>Verify You're Really Here.</h1>
                <p className={styles.subtitle}>Complete a quick liveness check to confirm you're physically present.</p>

                <h3 className={styles.sectionTitle}>Why We Perform Liveness Checks</h3>
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <span>👤</span> Real Person Verification
                    </div>
                    <div className={styles.infoCard}>
                        <span>🛡️</span> Anti-Spoof Protection
                    </div>
                    <div className={styles.infoCard}>
                        <span>👥</span> Safer Community
                    </div>
                    <div className={styles.infoCard}>
                        <span>🔒</span> Privacy Protected
                    </div>
                </div>

                <div className={styles.progressBox}>
                    <h3 className={styles.sectionTitle}>Verification Progress</h3>
                    <ul className={styles.progressList}>
                        {LIVENESS_PROMPTS.map((prompt, index) => (
                            <li key={prompt.id} className={
                                index === currentPromptIndex ? styles.activeStep : 
                                index < currentPromptIndex ? styles.completedStep : 
                                styles.pendingStep
                            }>
                                <span className={styles.radioCircle}></span>
                                {prompt.label}
                            </li>
                        ))}
                    </ul>
                </div>

                <h3 className={styles.sectionTitle}>Before You Begin</h3>
                <ul className={styles.checklist}>
                    <li>Face fully visible</li>
                    <li>Good lighting</li>
                    <li>Stay inside frame</li>
                    <li>Remove face coverings</li>
                    <li>Follow on-screen instructions</li>
                </ul>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.cameraCard}>
                    {error && <div className={styles.errorBanner}>{error}</div>}
                    
                    <div className={styles.videoContainer}>
                        <video ref={videoRef} autoPlay playsInline muted className={styles.videoFeed} />
                        
                        <div className={styles.videoOverlay}>
                            <div className={styles.dashedOval}></div>
                            <div className={styles.promptAction}>
                                <h2>{LIVENESS_PROMPTS[currentPromptIndex].label}</h2>
                                <button 
                                    onClick={startRecordingPrompt} 
                                    disabled={!streamReady || isRecording} 
                                    className={styles.recordBtn}
                                >
                                    {isRecording ? "⏳ Processing..." : "⌛ Waiting For Action..."}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.feedbackFooter}>
                        Feedback indicators will appear here
                    </div>
                </div>

                <div className={styles.footerActions}>
                    <button 
                        className={styles.continueBtn} 
                        disabled={currentPromptIndex < LIVENESS_PROMPTS.length} 
                        onClick={onSuccess}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};