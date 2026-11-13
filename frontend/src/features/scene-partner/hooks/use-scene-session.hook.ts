import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGetSessionByIdQuery, useSendTurnMutation, usePauseSessionMutation, useResumeSessionMutation, useEndSessionMutation } from '../api/scene-partner.api';
import { getErrorMessage } from '../../../shared/utils/error.util';
import { toast } from '../../../shared/utils/toast.util';

export const useSceneSession = (sessionId?: string) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const {
        data: sessionData,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetSessionByIdQuery(sessionId || '', {
        skip: !sessionId,
    });

    const session = sessionData?.data;

    const [sendTurn, { isLoading: isSendingTurn }] = useSendTurnMutation();
    const [pauseSession, { isLoading: isPausing }] = usePauseSessionMutation();
    const [resumeSession, { isLoading: isResuming }] = useResumeSessionMutation();
    const [endSession, { isLoading: isEnding }] = useEndSessionMutation();

    // Timer logic: compute remaining duration
    const maxSeconds = useMemo(() => {
        return (session?.maxDurationMinutes || 15) * 60;
    }, [session?.maxDurationMinutes]);

    useEffect(() => {
        if (!session || session.status !== 'IN_PROGRESS') {
            return;
        }

        const interval = setInterval(() => {
            if (!session.createdAt) return;
            const startMs = new Date(session.createdAt).getTime();
            const nowMs = Date.now();
            const totalPausedMs = session.totalPausedMs || 0;
            const activeMs = Math.max(0, nowMs - startMs - totalPausedMs);
            const activeSec = Math.floor(activeMs / 1000);
            setElapsedSeconds(activeSec);
        }, 1000);

        return () => clearInterval(interval);
    }, [session]);

    const remainingSeconds = Math.max(0, maxSeconds - elapsedSeconds);
    const isTimerExpired = maxSeconds > 0 && remainingSeconds === 0;

    const formattedTime = useMemo(() => {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [remainingSeconds]);

    const handleSendMessage = useCallback(async (content?: string): Promise<boolean> => {
        const contentToSend = (content ?? '').trim();
        if (!sessionId || !contentToSend || isSendingTurn || session?.status !== 'IN_PROGRESS') {
            return false;
        }

        try {
            await sendTurn({
                sessionId,
                content: contentToSend,
            }).unwrap();
            return true;
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to send message. Please try again.');
            toast.error(errorMsg);
            console.error('Failed to send turn:', err);
            return false;
        }
    }, [sessionId, isSendingTurn, session?.status, sendTurn]);

    const handlePause = useCallback(async () => {
        if (!sessionId || isPausing || session?.status !== 'IN_PROGRESS') return;
        try {
            await pauseSession({ sessionId }).unwrap();
            toast.success('Simulation paused.');
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to pause session.');
            toast.error(errorMsg);
            console.error('Failed to pause session:', err);
        }
    }, [sessionId, isPausing, session?.status, pauseSession]);

    const handleResume = useCallback(async () => {
        if (!sessionId || isResuming || session?.status !== 'PAUSED') return;
        try {
            await resumeSession({ sessionId }).unwrap();
            toast.success('Simulation resumed.');
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to resume session.');
            toast.error(errorMsg);
            console.error('Failed to resume session:', err);
        }
    }, [sessionId, isResuming, session?.status, resumeSession]);

    const handleEnd = useCallback(async () => {
        if (!sessionId || isEnding) return;
        try {
            const result = await endSession({ sessionId }).unwrap();
            toast.success('Session ended.');
            return result;
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to end session.');
            toast.error(errorMsg);
            console.error('Failed to end session:', err);
            throw err;
        }
    }, [sessionId, isEnding, endSession]);

    return {
        session,
        isLoading,
        isFetching,
        isError,
        error,
        handleSendMessage,
        isSendingTurn,
        handlePause,
        isPausing,
        handleResume,
        isResuming,
        handleEnd,
        isEnding,
        formattedTime,
        isTimerExpired,
        refetch,
    };
};
