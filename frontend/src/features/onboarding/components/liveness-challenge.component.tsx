import { useEffect, useRef, useState } from "react";
import { useSubmitLivenessMutation } from "../api/kycApi";
import { useAppDispatch } from "../../../app/hooks";
import { addLivenessResult } from "../slices/kycSlice";
import styles from './liveness-challenge.module.css';
import { useRollingBuffer } from "../hooks/use-rolling-buffer.hook";
import { calculateEAR, calculateSmileRatio, calculateYawRatio } from "../utils/liveness-heuristics.util";

// REMOVED: All executable imports for @mediapipe/face_mesh and camera_utils.
// ADDED: Import *only* the Types. Vite strips types at compile-time, completely preventing the bundler crashes.
import type { Results } from "@mediapipe/face_mesh";

const LIVENESS_PROMPTS = [
    { id: 'BLINK', label: 'Blink Eyes' },
    { id: 'TURN_LEFT', label: 'Turn Head Left' },
    { id: 'TURN_RIGHT', label: 'Turn Head Right' },
    { id: 'SMILE', label: 'Smile Naturally' }
];

export const LivenessChallenge = ({ onSuccess }: { onSuccess: () => void }) => {
    const dispatch = useAppDispatch();
    const [submitLiveness] = useSubmitLivenessMutation();
    const { startBuffering, stopBuffering, extractAndResetBuffer } = useRollingBuffer();

    const videoRef = useRef<HTMLVideoElement>(null);
    
    // REPLACED: Changed type to 'any' to avoid needing the broken camera_utils import
    const cameraRef = useRef<any>(null);

    const promptIndexRef = useRef(0); 
    const isProcessingRef = useRef(false);

    const [streamReady, setStreamReady] = useState(false);
    const [displayIndex, setDisplayIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(!videoRef.current) return;

        // ADDED: Holds the faceMesh instance so we can cleanly close it on unmount
        let faceMeshInstance: any = null;

        // ADDED: This async function bypasses Vite and forces the browser to load the clean binaries directly
        const initMediaPipe = async () => {
            try {
                if (!(window as any).FaceMesh || !(window as any).Camera) {
                    const loadScript = (src: string) => new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = src;
                        script.crossOrigin = "anonymous";
                        script.onload = resolve;
                        script.onerror = () => reject(new Error(`Failed to load ${src}`));
                        document.head.appendChild(script);
                    });
                    
                    // Injecting directly guarantees the constructors will be attached to the global window object
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
                }

                // Safely extract from the global window object
                const FaceMesh = (window as any).FaceMesh;
                const Camera = (window as any).Camera;

                // REPLACED: Instantiating from the globally loaded script, not the Vite bundle
                faceMeshInstance = new FaceMesh({
                    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
                });

                faceMeshInstance.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                faceMeshInstance.onResults(handleMeshResults);

                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if(videoRef.current && faceMeshInstance){
                            await faceMeshInstance.send({image: videoRef.current});
                        }
                    },
                    width: 1280,
                    height: 720
                });

                await camera.start();
                setStreamReady(true);
                
                if(videoRef.current?.srcObject){
                    startBuffering(videoRef.current.srcObject as MediaStream);
                }
                
                cameraRef.current = camera;
            } catch (err) {
                setError("Failed to initialize AI models. Please check your connection.");
            }
        };

        // ADDED: Trigger the bypass initialization
        initMediaPipe();

        return () => {
            stopBuffering();
            if (cameraRef.current) cameraRef.current.stop();
            if (faceMeshInstance) faceMeshInstance.close();
        }
    }, []);

    const handleMeshResults = (results: Results) => {
        if(!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;
        if(isProcessingRef.current || promptIndexRef.current >= LIVENESS_PROMPTS.length) return;

        const landmarks = results.multiFaceLandmarks[0];
        const currentPrompt = LIVENESS_PROMPTS[promptIndexRef.current].id;
        let actionDetected = false;

        switch(currentPrompt){
            case "BLINK": 
                actionDetected = calculateEAR(landmarks) < 0.18;
                break;
            case 'TURN_LEFT':
                actionDetected = calculateYawRatio(landmarks) < 0.35;
                break;
            case 'TURN_RIGHT':
                actionDetected = calculateYawRatio(landmarks) > 0.65;
                break;
            case 'SMILE':
                // Mouth corner spread expands relative to the rigid eye anchor distance.
                // ADDED: Geometric Guard - Only evaluate smile if the head is facing perfectly straight (Yaw between 0.4 and 0.6) to prevent 2D perspective distortion.
                const yaw = calculateYawRatio(landmarks);
                const isLookingForward = yaw > 0.40 && yaw < 0.60;
                actionDetected = isLookingForward && calculateSmileRatio(landmarks) > 0.45;
                break;
        }

        if(actionDetected) executeAsynchronousDispatch(currentPrompt);
    }

    const executeAsynchronousDispatch = async (promptId: string) => {
        isProcessingRef.current = true;

        const {blob, mimeType} = await extractAndResetBuffer();
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';

        const formData = new FormData();
        formData.append('video', blob, `liveness.${extension}`);
        formData.append('promptType', promptId);

        try {
            // Wait for the Python worker's authoritative verdict
            await submitLiveness(formData).unwrap();

            // Only update Redux and advance UI if the backend confirm the motion
            dispatch(addLivenessResult({prompt: promptId, completed: true}));

            const nextIndex = promptIndexRef.current + 1;
            promptIndexRef.current = nextIndex;
            setDisplayIndex(nextIndex);

            if(nextIndex >= LIVENESS_PROMPTS.length){
                stopBuffering();
                onSuccess();
            }else{
                setTimeout(() => {isProcessingRef.current = false;}, 1500);
            }
        } catch (error: any) {
            // Unlock the pipeline so the user can try the failed prompt again
            isProcessingRef.current = false;
            const errorMsg = typeof error?.data?.message === 'string'
                ? error.data.message 
                : "Background liveness synchronization failed.";
            setError(errorMsg)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.layoutWrapper}>
                <div className={styles.leftPanel}>
                    <h1 className={styles.mainTitle}>Verify You're Really Here.</h1>
                    <p className={styles.subtitle}>Complete a quick liveness check to confirm you're physically present.</p>
                    
                    <h3 className={styles.sectionTitle}>Why We Perform Liveness Checks</h3>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span>Real Person Verification</span>
                        </div>
                        <div className={styles.featureCard}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            <span>Anti-Spoof Protection</span>
                        </div>
                        <div className={styles.featureCard}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <span>Safer Community</span>
                        </div>
                        <div className={styles.featureCard}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <span>Privacy Protected</span>
                        </div>
                    </div>

                    <div className={styles.progressBox}>
                        <h3 className={styles.progressTitle}>Verification Progress</h3>
                        <ul className={styles.progressList}>
                            {LIVENESS_PROMPTS.map((prompt, index) => (
                                <li key={prompt.id} className={
                                    index === displayIndex ? styles.activeStep : 
                                    index < displayIndex ? styles.completedStep : styles.pendingStep
                                }>
                                    <div className={styles.radioIndicator}>
                                        {index === displayIndex && <div className={styles.radioDot}></div>}
                                    </div>
                                    <span className={styles.stepLabel}>{prompt.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <h3 className={styles.sectionTitle}>Before You Begin</h3>
                    <ul className={styles.checklist}>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Face fully visible</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Good lighting</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Stay inside frame</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Remove face coverings</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6200ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Follow on-screen instructions</li>
                    </ul>
                </div>

                <div className={styles.rightPanel}>
                    {error && <div className={styles.errorBanner}>{error}</div>}
                    
                    <div className={styles.videoCard}>
                        <div className={styles.videoContainer}>
                            <video ref={videoRef} playsInline muted className={styles.videoFeed} />
                            
                            <div className={styles.videoOverlay}>
                                <div className={styles.dashedOval}></div>
                                {streamReady && displayIndex < LIVENESS_PROMPTS.length && (
                                    <div className={styles.promptAction}>
                                        <h2>{LIVENESS_PROMPTS[displayIndex].label}</h2>
                                        <div className={styles.waitingPill}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                                            <span>Waiting For Action...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.feedbackBox}>
                        <span>Feedback indicators will appear here</span>
                    </div>
                </div>
            </div>

            <div className={styles.footerBar}>
                <button className={styles.continueBtn} disabled>Continue</button>
            </div>
        </div>
    );
};