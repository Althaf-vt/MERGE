import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useSubmitLiveSelfieMutation } from "../api/kycApi";
import styles from './LiveSelfieCapture.module.css';

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
                    setError("Falied to process image.");
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
                    setError(uploadError?.data?.message || "Biometric validation failed. please try again.");
                    setIsCapturing(false)
                }
            }, 'image/jpeg', 0.9);
        }
    }

    if(error){
        return <div className={styles.errorBox}>{error}</div>
    }

    return(
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Golden Identity Baseline</h2>
            <p className={styles.subtitle}>Position your face in the center of the frame and ensure you are in a well-lit area.</p>

            <div className={styles.videoContainer}>
                <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={styles.videoStream} 
                />
                {/* Hidden canvas used purely for extracting the image data */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <button 
                onClick={handleCapture} 
                className={styles.captureBtn} 
                disabled={isLoading || isCapturing || !stream}
            >
                {isLoading ? "Analyzing Biometrics..." : "Capture & Verify"}
            </button>
        </div>
    )
}