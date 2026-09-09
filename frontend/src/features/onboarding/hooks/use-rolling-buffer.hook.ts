import { useCallback, useRef } from "react";

const getSupportedMimeType = (): string => {
    const types = ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];
    for(const type of types){
        if(MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'video/webm';
}

export const useRollingBuffer = () => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const mimeTypeRef = useRef<string>(getSupportedMimeType());

    const startBuffering = useCallback((stream: MediaStream) => {
        if(mediaRecorderRef.current?.state === 'recording') return;

        chunksRef.current = [];
        const recorder = new MediaRecorder(stream, {mimeType: mimeTypeRef.current});

        recorder.ondataavailable = (e) => {
            if(e.data.size > 0){
                // We no longer splice. We continuously accumulate clean chunks for the duration of the prompt.
                chunksRef.current.push(e.data);
            }
        }
        
        recorder.start(200);
        mediaRecorderRef.current = recorder;
    },[]);

    const stopBuffering = useCallback(() => {
        if(mediaRecorderRef.current?.state !== 'inactive'){
            mediaRecorderRef.current?.stop();
        }
    },[]);

    // Asynchronously stops the recording to compile a clean video file, then instantly restarts it for the next prompt
    const extractAndResetBuffer = useCallback(async (): Promise<{blob: Blob; mimeType: string}> => {
        return new Promise((resolve) => {
            const recorder = mediaRecorderRef.current;
            if (!recorder || recorder.state === 'inactive') {
                resolve({ blob: new Blob(chunksRef.current, {type: mimeTypeRef.current}), mimeType: mimeTypeRef.current });
                return;
            }

            const onStop = () => {
                // Compile the clean, uncorrupted byte stream
                const blob = new Blob(chunksRef.current, {type: mimeTypeRef.current});
                
                // Clear memory and restart the recorder immediately for the next action
                chunksRef.current = [];
                recorder.removeEventListener('stop', onStop);
                recorder.start(200);
                
                resolve({blob, mimeType: mimeTypeRef.current});
            };

            recorder.addEventListener('stop', onStop);
            recorder.stop(); // Force flush the final chunks
        });
    }, []);

    return { startBuffering, stopBuffering, extractAndResetBuffer }
}