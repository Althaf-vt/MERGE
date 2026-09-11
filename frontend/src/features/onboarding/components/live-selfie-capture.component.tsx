import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useSubmitLiveSelfieMutation } from "../api/kyc.api";
import { getErrorMessage } from "../../../shared/utils/error.util";
import styles from './live-selfie-capture.module.css';

interface LiveSelfieCaptureProps{
    onSuccess: () => void // Callback to trigger when upload succeeds
}

export const LiveSelfieCapture: React.FC<LiveSelfieCaptureProps> = ({onSuccess}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const [submitSelfie, {isLoading}] = useSubmitLiveSelfieMutation();

    // Initialize the camera when the component mounts
    useEffect(() => {
        const startCamera = async() => {
            try {
                // Request the front-facing camera
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {facingMode: 'user', width: {ideal: 1280}, height: {ideal: 720}}
                });

                setStream(mediaStream);
                if(videoRef.current){
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (error: any) {
                console.error("Camera access denied: ", error);
                setError("Camera access is required, Please allow permission in your browser.");
            }
        }

        startCamera();

        // Cleanup function: Turn off the camera when the user leaves the page
        return () => {
            if(stream){
                stream.getTracks().forEach((track) => track.stop());
            }
        }
    },[]);

    const handleCapture = async () => {
        if(!videoRef.current || !canvasRef.current) return;
        setIsCapturing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if(context){
            // set canvas dimensions to match the actual video stream
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the current video onto the canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert the canvas drawing into a standalone JPG file Blob
            canvas.toBlob(async (blob) => {
                if(!blob){
                    setError("Failed to process image.");
                    setIsCapturing(false);
                    return;
                }

                const file = new File([blob], 'live-selfie.jpg', {type: 'image/jpeg'});
                const formData = new FormData();
                formData.append('selfie',file);

                try {
                    await submitSelfie(formData).unwrap();
                    // Stop the camera tracks immediately on success
                    stream?.getTracks().forEach(t => t.stop());
                    onSuccess();
                } catch (uploadError: any) {
                    setError(getErrorMessage(uploadError, "Biometric validation failed. please try again."));
                    setIsCapturing(false)
                }
            }, 'image/jpeg', 0.9);
        }
    }

    if(error){
        return <div className={styles.errorBox}>{error}</div>
    }

    return(
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <h1 className={styles.mainTitle}>Take a Selfie.</h1>
                <p className={styles.subtitle}>Step 2 of 5: We'll use this photo to verify your identity and protect the MERGE community.</p>

                <h3 className={styles.sectionTitle}>Selfie Guidelines</h3>
                <div className={styles.guidelineGrid}>
                    <div className={styles.guideCard}>
                        <div className={styles.iconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="19.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        </div>
                        <span>Good Lighting</span>
                    </div>
                    <div className={styles.guideCard}>
                        <div className={styles.iconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </div>
                        <span>Eyes Visible</span>
                    </div>
                    <div className={styles.guideCard}>
                        <div className={styles.iconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <span>One Person Only</span>
                    </div>
                </div>

                <div className={styles.checklistCard}>
                    <h4>BEFORE YOU CONTINUE</h4>
                    <ul className={styles.checklist}>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Good Lighting</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Eyes Visible</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Single Face</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Looking At Camera</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> No Face Coverings</li>
                    </ul>
                </div>

                <div className={styles.securityNote}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
                    <span>Your selfie is used only for identity verification and face matching. It is never displayed publicly.</span>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.videoCard}>
                    <div className={styles.videoContainer}>
                        <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={styles.videoStream} 
                        />
                        <div className={styles.videoOverlay}>
                            <div className={styles.faceGuideOval}>
                                {!stream && (
                                    <div className={styles.cameraPlaceholder}>
                                        <div className={styles.cameraIconCircle}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                        </div>
                                        <h3>Allow Camera Access</h3>
                                        <p>We need access to your camera to take a secure selfie for verification.</p>
                                    </div>
                                )}
                            </div>
                            {stream && <div className={styles.overlayTextPill}>Position your face inside the frame.</div>}
                        </div>
                        {/* Hidden canvas used purely for extracting the image data */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                </div>

                <div className={styles.statusBar}>
                    <div className={styles.statusIndicator}>
                        <div className={styles.statusDot}></div>
                        <span>{stream ? "Face Detected" : "Face Not Detected"}</span>
                    </div>
                    <div className={styles.statusIcons}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="19.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                </div>
                
                <div className={styles.actionRow}>
                    <button 
                        onClick={handleCapture} 
                        className={styles.captureBtn} 
                        disabled={isLoading || isCapturing || !stream}
                    >
                        {isLoading ? "Analyzing Biometrics..." : "Next Step"}
                    </button>
                </div>
            </div>
        </div>
    )
}