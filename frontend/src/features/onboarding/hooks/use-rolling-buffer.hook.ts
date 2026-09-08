import { useCallback, useRef } from "react";

const getSupportedMimeType = (): string => {
    const types = ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];
    for(const type of types){
        if(MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'video/webm';
}

export const useRollingBuffer = (maxDurationMs: number = 3000) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const mimeTypeRef = useRef<string>(getSupportedMimeType());

    const startBuffering = useCallback((stream: MediaStream) => {
        if(mediaRecorderRef.current?.state === 'recording') return;

        chunksRef.current = [];
        const recorder = new MediaRecorder(stream, {mimeType: mimeTypeRef.current});

        // Calculate max chunks based on a 200ms recording interval
        const maxChunks = Math.ceil(maxDurationMs / 200);

        recorder.ondataavailable = (e) => {
            if(e.data.size > 0){
                chunksRef.current.push(e.data);
                // Evict the oldest chunk if we exceed the time boundary
                if(chunksRef.current.length > maxChunks){
                    chunksRef.current.splice(1, 1); // keep [0] (header), drop oldest media chunk
                }
            }
        }
        
        recorder.start(200);
        mediaRecorderRef.current = recorder;
    },[maxDurationMs]);

    const stopBuffering = useCallback(() => {
        if(mediaRecorderRef.current?.state !== 'inactive'){
            mediaRecorderRef.current?.stop();
        }
    },[]);

    const extractBuffer = useCallback((): {blob: Blob; mimeType: string} => {
        // Compile the current temporal window into a single Blob
        const blob = new Blob(chunksRef.current, {type: mimeTypeRef.current});
        return {blob, mimeType: mimeTypeRef.current};
    }, []);

    return {startBuffering, stopBuffering, extractBuffer}
}