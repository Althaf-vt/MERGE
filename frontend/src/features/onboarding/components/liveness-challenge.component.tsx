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
            <div className={styles.leftPanel}>
                <h1 className={styles.mainTitle}>Verify You're Really Here.</h1>
                <p className={styles.subtitle}>Perform the actions on screen to verify your physical presence.</p>
                
                <div className={styles.progressBox}>
                    <h3 className={styles.sectionTitle}>Verification Sequence</h3>
                    <ul className={styles.progressList}>
                        {LIVENESS_PROMPTS.map((prompt, index) => (
                            <li key={prompt.id} className={
                                index === displayIndex ? styles.activeStep : 
                                index < displayIndex ? styles.completedStep : styles.pendingStep
                            }>
                                <span className={styles.radioCircle}></span>
                                {prompt.label}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.cameraCard}>
                    {error && <div className={styles.errorBanner}>{error}</div>}
                    
                    <div className={styles.videoContainer}>
                        <video ref={videoRef} playsInline muted className={styles.videoFeed} />
                        
                        <div className={styles.videoOverlay}>
                            <div className={styles.dashedOval}></div>
                            {streamReady && displayIndex < LIVENESS_PROMPTS.length && (
                                <div className={styles.promptAction}>
                                    <h2>{LIVENESS_PROMPTS[displayIndex].label}</h2>
                                    <p className={styles.pulseText}>Detecting motion...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};