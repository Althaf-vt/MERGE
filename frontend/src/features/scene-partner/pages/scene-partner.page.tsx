import React, { useState } from 'react';
import { useGetActiveSessionQuery, useStartSessionMutation, useEndSessionMutation } from '../api/scene-partner.api';
import { useSceneScenarios } from '../hooks/use-scene-scenarios.hook';
import { useSceneSession } from '../hooks/use-scene-session.hook';
import { useSceneHistory } from '../hooks/use-scene-history.hook';
import { ScenePartnerHome } from '../components/scene-partner-home.component';
import { ActiveSessionBanner } from '../components/active-session-banner.component';
import { SimulationChat } from '../components/simulation-chat.component';
import { SessionSummaryModal } from '../components/session-summary-modal.component';
import { SessionHistoryList } from '../components/session-history-list.component';
import type { SceneSessionDto, SimulationType } from '../types/scene-partner.types';
import styles from './scene-partner.module.css';

export const ScenePartnerPage: React.FC = () => {
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
            console.error('Failed to start scene session:', err);
        } finally {
            setStartingScenarioId(null);
        }
    };

    const handleEndCurrentSimulation = async () => {
        const ended = await handleEnd();
        if (ended?.data) {
            setSummaryModalSession(ended.data);
            setIsSummaryModalOpen(true);
        }
        setActiveSessionId(null);
    };

    const handleEndBannerSession = async () => {
        if (!activeSession) return;
        try {
            const res = await endActiveSession({ sessionId: activeSession.id }).unwrap();
            if (res.data?.summary) {
                setSummaryModalSession(res.data);
                setIsSummaryModalOpen(true);
            }
        } catch (err) {
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
            console.error('Failed to restart simulation:', err);
        }
    };

    // If currently inside an active simulation chat session
    if (activeSessionId && currentSimSession) {
        return (
            <main className={styles.pageContainer}>
                <div className={styles.contentWrapper} style={{ maxWidth: '1240px' }}>
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
                />
            </main>
        );
    }

    return (
        <main className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* Active Session Banner (if an ongoing session is found) */}
                {activeSession && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <ActiveSessionBanner
                            session={activeSession}
                            onResume={() => setActiveSessionId(activeSession.id)}
                            onEnd={handleEndBannerSession}
                            isEnding={isEndingActive}
                        />
                    </div>
                )}

                {/* Tab: Scenarios / Scene Partner Home */}
                {mainTab === 'SCENARIOS' && (
                    <ScenePartnerHome
                        scenarios={scenarios}
                        isLoadingScenarios={isScenariosLoading}
                        isStarting={Boolean(startingScenarioId)}
                        onStartPractice={handleStartPracticeFromHome}
                        onViewHistory={() => setMainTab('HISTORY')}
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
                            onViewSummary={handleOpenSummary}
                        />
                    </section>
                )}
            </div>

            {/* Debrief Modal */}
            <SessionSummaryModal
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                session={summaryModalSession}
            />
        </main>
    );
};
