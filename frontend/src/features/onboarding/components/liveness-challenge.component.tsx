import { useEffect, useRef, useState } from "react";
import { useSubmitLivenessMutation } from "../api/kycApi";
import styles from './liveness-challenge.module.css';
import { useAppDispatch } from "../../../app/hooks";
import { addLivenessResult } from "../slices/kycSlice";

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
    return 'video/webm'; // Falls back to the browser's default if none match
};
const LIVENESS_PROMPTS = ['BLINK', 'TURN_LEFT', 'SMILE'];

export const LivenessChallenge = ({ onSuccess }: { onSuccess: () => void }) => {
    const dispatch = useAppDispatch();
    const [submitLiveness] = useSubmitLivenessMutation();
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streamReady, setStreamReady] = useState(false);
    
    // State machine for tracking prompts
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Keep your existing useEffect for initializing the camera stream here...

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
            await handlePromptSubmission(blob, mimeType, LIVENESS_PROMPTS[currentPromptIndex]);
        };

        mediaRecorder.start(200);

        // Record a short 3-second clip for the specific action
        setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        }, 3000);
    };

    const handlePromptSubmission = async (videoBlob: Blob, mimeType: string, promptType: string) => {
        const formData = new FormData();
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        formData.append('video', videoBlob, `liveness.${extension}`);
        formData.append('promptType', promptType); // Pass the specific prompt to the backend

        try {
            // Optimistically mark as completed in Redux for the review screen
            dispatch(addLivenessResult({ prompt: promptType, completed: true }));
            
            // Push to backend asynchronously
            await submitLiveness(formData).unwrap();
            
            // Move to the next prompt, or finish if all are done
            if (currentPromptIndex + 1 < LIVENESS_PROMPTS.length) {
                setCurrentPromptIndex(prev => prev + 1);
            } else {
                onSuccess(); // Triggers the move to the Review screen
            }
        } catch (err: any) {
            setError(err?.data?.message || "Liveness check failed. Please try again.");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Liveness Challenge</h2>
            <p className={styles.subtitle}>
                {/* Dynamically instruct the user based on the current prompt */}
                Action {currentPromptIndex + 1} of {LIVENESS_PROMPTS.length}: 
                <strong> Please {LIVENESS_PROMPTS[currentPromptIndex].replace('_', ' ')}</strong>
            </p>

            {error && <div className={styles.errorText}>{error}</div>}

            <div className={styles.videoWrapper}>
                <video ref={videoRef} autoPlay playsInline muted 
                    className={`${styles.videoFeed} ${isRecording ? styles.recordingPulse : ''}`}
                />
            </div>

            <button onClick={startRecordingPrompt} className={styles.primaryBtn} disabled={!streamReady || isRecording}>
                {isRecording ? "Recording Action..." : `Record ${LIVENESS_PROMPTS[currentPromptIndex].replace('_', ' ')}`}
            </button>
        </div>
    );
};