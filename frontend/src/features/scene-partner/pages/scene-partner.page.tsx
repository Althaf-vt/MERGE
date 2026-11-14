import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetActiveSessionQuery, useStartSessionMutation, useEndSessionMutation } from '../api/scene-partner.api';
import { useSceneScenarios } from '../hooks/use-scene-scenarios.hook';
import { useSceneSession } from '../hooks/use-scene-session.hook';
import { useSceneHistory } from '../hooks/use-scene-history.hook';
import { ScenePartnerHome } from '../components/scene-partner-home.component';
import { SimulationChat } from '../components/simulation-chat.component';
import { SessionSummaryModal } from '../components/session-summary-modal.component';
import { SessionHistoryList } from '../components/session-history-list.component';
import { ScenePartnerToastContainer } from '../components/scene-partner-toast.component';
import { getErrorMessage } from '../../../shared/utils/error.util';
import { toast } from '../../../shared/utils/toast.util';
import type { SceneSessionDto, SimulationType } from '../types/scene-partner.types';
import styles from './scene-partner.module.css';

export const ScenePartnerPage: React.FC = () => {
    const navigate = useNavigate();
    const [mainTab, setMainTab] = useState<'SCENARIOS' | 'HISTORY'>('SCENARIOS');
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // Summary debrief modal state
    const [summaryModalSession, setSummaryModalSession] = useState<SceneSessionDto | null>(null);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    // Starting session mutation state
    const [startingScenarioId, setStartingScenarioId] = useState<string | null>(null);
    const [startSession] = useStartSessionMutation();
    const [endActiveSession, { isLoading: isEndingActive }] = useEndSessionMutation();

    // Active session query for hub banner
    const { data: activeSessionResponse } = useGetActiveSessionQuery();
    const activeSession = activeSessionResponse?.data ?? null;

    // Scenarios Hook
    const {
        scenarios,
        isLoading: isScenariosLoading,
        isError: isScenariosError,
        error: scenariosError,
        refetch: refetchScenarios,
    } = useSceneScenarios();

    // History Hook
    const {
        sessions: historySessions,
        total: historyTotal,
        page: historyPage,
        setPage: setHistoryPage,
        totalPages: historyTotalPages,
        hasNextPage: historyHasNextPage,
        hasPreviousPage: historyHasPreviousPage,
        isLoading: isHistoryLoading,
        isError: isHistoryError,
        error: historyError,
        refetch: refetchHistory,
    } = useSceneHistory();

    // Active Simulation Hook (for when user is in simulation view)
    const {
        session: currentSimSession,
        handleSendMessage,
        isSendingTurn,
        handlePause,
        isPausing,
        handleResume,
        isResuming,
        handleEnd,
        isEnding,
        formattedTime,
        isError: isSimSessionError,
        error: simSessionError,
    } = useSceneSession(activeSessionId || undefined);

    const handleStartPracticeFromHome = async (payload: {
        scenarioId: string;
        simulationType: SimulationType;
        targetUserId?: string;
        partnerName: string;
    }) => {
        try {
            setStartingScenarioId(payload.scenarioId);
            const res = await startSession({
                scenarioId: payload.scenarioId,
                simulationType: payload.simulationType,
                targetUserId: payload.targetUserId,
            }).unwrap();

            if (res.data) {
                setActiveSessionId(res.data.id);
            }
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to start practice session.');
            toast.error(errorMsg);
            console.error('Failed to start scene session:', err);
        } finally {
            setStartingScenarioId(null);
        }
    };

    const handleEndCurrentSimulation = async () => {
        try {
            const ended = await handleEnd();
            if (ended?.data) {
                setSummaryModalSession(ended.data);
                setIsSummaryModalOpen(true);
            }
            setActiveSessionId(null);
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to end practice session.');
            toast.error(errorMsg);
            console.error('Failed to end current simulation:', err);
        }
    };

    const handleEndBannerSession = async () => {
        if (!activeSession) return;
        try {
            const res = await endActiveSession({ sessionId: activeSession.id }).unwrap();
            toast.success('Session ended.');
            if (res.data?.summary) {
                setSummaryModalSession(res.data);
                setIsSummaryModalOpen(true);
            }
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to end active session.');
            toast.error(errorMsg);
            console.error('Failed to end active session from banner:', err);
        }
    };

    const handleOpenSummary = (session: SceneSessionDto) => {
        setSummaryModalSession(session);
        setIsSummaryModalOpen(true);
    };

    const handleRestartCurrentSimulation = async () => {
        if (!currentSimSession) return;
        try {
            await handleEnd();
            await handleStartPracticeFromHome({
                scenarioId: currentSimSession.scenarioId,
                simulationType: currentSimSession.simulationType,
                targetUserId: currentSimSession.targetUserId ?? undefined,
                partnerName: currentSimSession.simulationType === 'MATCH_BASED' ? 'Match Partner' : 'Generic Partner',
            });
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to restart simulation.');
            toast.error(errorMsg);
            console.error('Failed to restart simulation:', err);
        }
    };

    const handlePracticeAgainFromSummary = (session: SceneSessionDto) => {
        setIsSummaryModalOpen(false);
        handleStartPracticeFromHome({
            scenarioId: session.scenarioId,
            simulationType: session.simulationType,
            targetUserId: session.targetUserId ?? undefined,
            partnerName: session.simulationType === 'MATCH_BASED' ? 'Match Partner' : 'Generic Partner',
        });
    };

    const handleTryNewScenarioFromSummary = () => {
        setIsSummaryModalOpen(false);
        setActiveSessionId(null);
        setMainTab('SCENARIOS');
    };

    const handleReturnToMatchesFromSummary = () => {
        setIsSummaryModalOpen(false);
        setActiveSessionId(null);
        navigate('/connections');
    };

    // If active session ID is set but failed to load from backend
    if (activeSessionId && isSimSessionError) {
        return (
            <main className={styles.pageContainer}>
                <ScenePartnerToastContainer />
                <div className={styles.contentWrapper} style={{ maxWidth: '760px', padding: '3rem 1rem', textAlign: 'center' }}>
                    <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '1.5rem', color: '#991B1B' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700 }}>
                            Unable to Load Rehearsal Session
                        </h3>
                        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.4 }}>
                            {getErrorMessage(simSessionError, 'The requested practice session could not be found or loaded from the server.')}
                        </p>
                        <button
                            type="button"
                            onClick={() => setActiveSessionId(null)}
                            className={styles.backButton}
                            style={{ margin: '0 auto', display: 'inline-flex' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                            </svg>
                            <span>Back to Scene Partner</span>
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // If currently inside an active simulation chat session
    if (activeSessionId && currentSimSession) {
        return (
            <main className={`${styles.pageContainer} ${styles.chatPageContainer}`}>
                <ScenePartnerToastContainer />
                <div className={styles.chatContentWrapper}>
                    <SimulationChat
                        session={currentSimSession}
                        onSendMessage={handleSendMessage}
                        onPause={handlePause}
                        onResume={handleResume}
                        onEnd={handleEndCurrentSimulation}
                        onRestart={handleRestartCurrentSimulation}
                        onBack={() => setActiveSessionId(null)}
                        isSendingTurn={isSendingTurn}
                        isPausing={isPausing}
                        isResuming={isResuming}
                        isEnding={isEnding}
                        formattedTime={formattedTime}
                    />
                </div>

                <SessionSummaryModal
                    isOpen={isSummaryModalOpen}
                    onClose={() => setIsSummaryModalOpen(false)}
                    session={summaryModalSession}
                    onPracticeAgain={handlePracticeAgainFromSummary}
                    onTryNewScenario={handleTryNewScenarioFromSummary}
                    onReturnToMatches={handleReturnToMatchesFromSummary}
                />
            </main>
        );
    }

    return (
        <main className={styles.pageContainer}>
            <ScenePartnerToastContainer />
            <div className={styles.contentWrapper}>
                {/* Tab: Scenarios / Scene Partner Home */}
                {mainTab === 'SCENARIOS' && (
                    <ScenePartnerHome
                        scenarios={scenarios}
                        isLoadingScenarios={isScenariosLoading}
                        isStarting={Boolean(startingScenarioId)}
                        onStartPractice={handleStartPracticeFromHome}
                        onViewHistory={() => setMainTab('HISTORY')}
                        activeSession={activeSession}
                        onResumeActive={() => activeSession && setActiveSessionId(activeSession.id)}
                        onEndActive={handleEndBannerSession}
                        isEndingActive={isEndingActive}
                        isScenariosError={isScenariosError}
                        scenariosErrorMessage={getErrorMessage(scenariosError, 'Failed to load practice scenarios.')}
                        onRetryScenarios={refetchScenarios}
                    />
                )}

                {/* Tab: Past Debriefs / History */}
                {mainTab === 'HISTORY' && (
                    <section aria-label="Practice History">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <button
                                type="button"
                                className={styles.backButton}
                                onClick={() => setMainTab('SCENARIOS')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                                </svg>
                                <span>Back to Scene Partner</span>
                            </button>
                        </div>

                        <SessionHistoryList
                            sessions={historySessions}
                            total={historyTotal}
                            page={historyPage}
                            totalPages={historyTotalPages}
                            onPageChange={setHistoryPage}
                            hasNextPage={historyHasNextPage}
                            hasPreviousPage={historyHasPreviousPage}
                            isLoading={isHistoryLoading}
                            isError={isHistoryError}
                            errorMessage={getErrorMessage(historyError, 'Failed to load past sessions.')}
                            onRetry={refetchHistory}
                            onViewSummary={handleOpenSummary}
                            onPracticeAgain={handlePracticeAgainFromSummary}
                            onContinueSession={(session) => setActiveSessionId(session.id)}
                            onStartNewSession={() => setMainTab('SCENARIOS')}
                        />
                    </section>
                )}
            </div>

            {/* Debrief Modal */}
            <SessionSummaryModal
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                session={summaryModalSession}
                onPracticeAgain={handlePracticeAgainFromSummary}
                onTryNewScenario={handleTryNewScenarioFromSummary}
                onReturnToMatches={handleReturnToMatchesFromSummary}
            />
        </main>
    );
};
