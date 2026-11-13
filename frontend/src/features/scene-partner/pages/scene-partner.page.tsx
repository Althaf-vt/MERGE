import React, { useState } from 'react';
import { useGetActiveSessionQuery, useStartSessionMutation, useEndSessionMutation } from '../api/scene-partner.api';
import { useSceneScenarios } from '../hooks/use-scene-scenarios.hook';
import { useSceneSession } from '../hooks/use-scene-session.hook';
import { useSceneHistory } from '../hooks/use-scene-history.hook';
import { ScenarioCategoryTabs } from '../components/scenario-category-tabs.component';
import { ScenarioCard } from '../components/scenario-card.component';
import { ActiveSessionBanner } from '../components/active-session-banner.component';
import { SimulationChat } from '../components/simulation-chat.component';
import { SessionSummaryModal } from '../components/session-summary-modal.component';
import { SessionHistoryList } from '../components/session-history-list.component';
import type { ScenarioDto, SceneSessionDto } from '../types/scene-partner.types';
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
        activeCategory,
        setActiveCategory,
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

    const handleStartPractice = async (scenario: ScenarioDto) => {
        try {
            setStartingScenarioId(scenario.id);
            const res = await startSession({
                scenarioId: scenario.id,
                simulationType: 'GENERIC',
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

    // If currently inside an active simulation chat session
    if (activeSessionId && currentSimSession) {
        return (
            <main className={styles.pageContainer}>
                <div className={styles.contentWrapper}>
                    <div className={styles.simulationViewWrapper}>
                        <div className={styles.backBar}>
                            <button
                                type="button"
                                className={styles.backButton}
                                onClick={() => setActiveSessionId(null)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                                </svg>
                                <span>Back to Practice Hub</span>
                            </button>
                        </div>

                        <SimulationChat
                            session={currentSimSession}
                            onSendMessage={handleSendMessage}
                            onPause={handlePause}
                            onResume={handleResume}
                            onEnd={handleEndCurrentSimulation}
                            isSendingTurn={isSendingTurn}
                            isPausing={isPausing}
                            isResuming={isResuming}
                            isEnding={isEnding}
                            formattedTime={formattedTime}
                        />
                    </div>
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
                {/* Header */}
                <header className={styles.headerSection}>
                    <div className={styles.titleRow}>
                        <h1 className={styles.pageTitle}>Scene Partner</h1>
                    </div>
                    <p className={styles.pageSubtitle}>
                        Your AI Dating Coach. Practice real-world dating conversations and receive real-time, constructive feedback.
                    </p>

                    {/* Navigation Tabs */}
                    <nav className={styles.mainTabsNav} role="tablist" aria-label="Practice navigation">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mainTab === 'SCENARIOS'}
                            className={`${styles.mainTabButton} ${mainTab === 'SCENARIOS' ? styles.mainTabButtonActive : ''}`}
                            onClick={() => setMainTab('SCENARIOS')}
                        >
                            Explore Scenarios
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mainTab === 'HISTORY'}
                            className={`${styles.mainTabButton} ${mainTab === 'HISTORY' ? styles.mainTabButtonActive : ''}`}
                            onClick={() => setMainTab('HISTORY')}
                        >
                            Past Debriefs {historyTotal > 0 && `(${historyTotal})`}
                        </button>
                    </nav>
                </header>

                {/* Active Session Banner (if an ongoing session is found) */}
                {activeSession && (
                    <ActiveSessionBanner
                        session={activeSession}
                        onResume={() => setActiveSessionId(activeSession.id)}
                        onEnd={handleEndBannerSession}
                        isEnding={isEndingActive}
                    />
                )}

                {/* Tab: Scenarios */}
                {mainTab === 'SCENARIOS' && (
                    <section aria-label="Practice Scenarios">
                        <ScenarioCategoryTabs
                            activeCategory={activeCategory}
                            onSelectCategory={setActiveCategory}
                        />

                        {isScenariosLoading ? (
                            <div className={styles.loadingCenter} aria-busy="true">
                                <div className={styles.spinner} />
                                <span>Loading scenarios...</span>
                            </div>
                        ) : (
                            <div className={styles.scenariosGrid}>
                                {scenarios.map((scenario) => (
                                    <ScenarioCard
                                        key={scenario.id}
                                        scenario={scenario}
                                        onStartPractice={handleStartPractice}
                                        isStarting={startingScenarioId === scenario.id}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Tab: Past Debriefs / History */}
                {mainTab === 'HISTORY' && (
                    <section aria-label="Practice History">
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
