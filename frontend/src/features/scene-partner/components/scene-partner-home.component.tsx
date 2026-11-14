import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetConnectionsQuery } from '../../../shared/api/connections.api';
import type { ScenarioDto, SimulationType, SceneSessionDto } from '../types/scene-partner.types';
import { ActiveSessionBanner } from './active-session-banner.component';
import styles from './scene-partner-home.module.css';

export interface SelectedPartnerState {
    type: SimulationType;
    targetUserId?: string;
    name: string;
}

export interface ScenePartnerHomeProps {
    scenarios: ScenarioDto[];
    isLoadingScenarios?: boolean;
    isStarting?: boolean;
    onStartPractice: (payload: {
        scenarioId?: string;
        simulationType: SimulationType;
        targetUserId?: string;
        partnerName: string;
        customPrompt?: string;
        customTitle?: string;
        isCoachingEnabled?: boolean;
    }) => Promise<void>;
    onViewHistory: () => void;
    activeSession?: SceneSessionDto | null;
    onResumeActive?: () => void;
    onEndActive?: () => void;
    isEndingActive?: boolean;
    isScenariosError?: boolean;
    scenariosErrorMessage?: string;
    onRetryScenarios?: () => void;
}

export const ScenePartnerHome: React.FC<ScenePartnerHomeProps> = ({
    scenarios,
    isLoadingScenarios = false,
    isStarting = false,
    onStartPractice,
    onViewHistory,
    activeSession,
    onResumeActive,
    onEndActive,
    isEndingActive = false,
    isScenariosError = false,
    scenariosErrorMessage,
    onRetryScenarios,
}) => {
    const navigate = useNavigate();

    // Fetch accepted matches for Match-Based rehearsal
    const { data: connectionsResponse, isLoading: isLoadingConnections } = useGetConnectionsQuery({
        role: 'BOTH',
        status: 'ACCEPTED',
        page: 1,
        limit: 20,
    });

    const activeMatches = connectionsResponse?.data ?? [];

    const [selectedPartner, setSelectedPartner] = useState<SelectedPartnerState>({
        type: 'GENERIC',
        name: 'Generic Practice Partner',
    });

    const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
        scenarios[0]?.id || ''
    );
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [isCoachingEnabled, setIsCoachingEnabled] = useState<boolean>(true);

    useEffect(() => {
        if (!selectedScenarioId && scenarios.length > 0 && !customPrompt.trim()) {
            setSelectedScenarioId(scenarios[0].id);
        }
    }, [scenarios, selectedScenarioId, customPrompt]);

    const isCustomScenarioActive = customPrompt.trim().length > 0;
    const activeCatalogScenario = scenarios.find((s) => s.id === selectedScenarioId);
    const activeScenarioTitle = isCustomScenarioActive
        ? 'Custom Scenario'
        : (activeCatalogScenario?.title || (isLoadingScenarios ? 'Loading...' : 'Select a Scenario'));

    const handleSelectGeneric = () => {
        setSelectedPartner({
            type: 'GENERIC',
            name: 'Generic Practice Partner',
        });
    };

    const handleSelectMatch = (partnerId: string, partnerName: string) => {
        setSelectedPartner({
            type: 'MATCH_BASED',
            targetUserId: partnerId,
            name: partnerName,
        });
    };

    const handleSelectPredefinedScenario = (scenarioId: string) => {
        setSelectedScenarioId(scenarioId);
        setCustomPrompt('');
    };

    const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setCustomPrompt(val);
        if (val.trim().length > 0) {
            setSelectedScenarioId('');
        }
    };

    const handleStart = async () => {
        const isCustom = customPrompt.trim().length > 0;
        if (!isCustom && !selectedScenarioId) return;

        await onStartPractice({
            scenarioId: isCustom ? undefined : selectedScenarioId,
            customPrompt: isCustom ? customPrompt.trim() : undefined,
            customTitle: isCustom ? 'Custom Scenario' : undefined,
            simulationType: selectedPartner.type,
            targetUserId: selectedPartner.targetUserId,
            partnerName: selectedPartner.name,
            isCoachingEnabled,
        });
    };



    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleRow}>
                    <svg className={styles.sparkleIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                        <path d="M5 3v4"/>
                        <path d="M19 17v4"/>
                        <path d="M3 5h4"/>
                        <path d="M17 19h4"/>
                    </svg>
                    <h1 className={styles.title}>Scene Partner</h1>
                    <span className={styles.premiumBadge}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                        Premium
                    </span>
                </div>
                <p className={styles.subtitle}>
                    Practice conversations before sending them in real life. Build confidence, explore scenarios, and prepare for meaningful connections.
                </p>
            </header>

            {/* Active Ongoing Practice Banner (Home Page only) */}
            {activeSession && (
                <ActiveSessionBanner
                    session={activeSession}
                    onResume={onResumeActive || (() => {})}
                    onEnd={onEndActive || (() => {})}
                    isEnding={isEndingActive}
                />
            )}

            {/* Main Hub Card */}
            <div className={styles.hubCard}>
                {/* Section 1: Choose Practice Partner */}
                <section aria-labelledby="partner-heading" className={styles.sectionBlock}>
                    <h2 id="partner-heading" className={styles.sectionTitle}>
                        Choose Practice Partner
                    </h2>

                    {/* Generic Practice Partner Card */}
                    <div
                        className={`${styles.genericPartnerCard} ${selectedPartner.type === 'GENERIC' ? styles.genericPartnerCardSelected : ''}`}
                        onClick={handleSelectGeneric}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectGeneric();
                            }
                        }}
                    >
                        <div className={styles.genericIconWrapper}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div className={styles.genericTextCol}>
                            <span className={styles.genericTitle}>Generic Practice Partner</span>
                            <span className={styles.genericSubtitle}>Practice with a balanced conversation partner.</span>
                        </div>
                    </div>

                    {/* Match Cards Carousel */}
                    <div className={styles.matchesCarousel} role="region" aria-label="Available Practice Partners">
                        {isLoadingConnections ? (
                            <div className={styles.loadingMatchesNotice}>Loading matches...</div>
                        ) : activeMatches.length > 0 ? (
                            activeMatches.map((match) => {
                                const isSelected = selectedPartner.type === 'MATCH_BASED' && selectedPartner.targetUserId === match.partnerId;

                                return (
                                    <div
                                        key={match.id}
                                        className={`${styles.matchCard} ${isSelected ? styles.matchCardSelected : ''}`}
                                        onClick={() => handleSelectMatch(match.partnerId, match.partnerName)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleSelectMatch(match.partnerId, match.partnerName);
                                            }
                                        }}
                                    >
                                        {isSelected && (
                                            <div className={styles.selectedCheckmarkBadge} aria-label="Selected">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* 4-Photo Quadrant Grid */}
                                        <div className={styles.photoGrid}>
                                            <div className={styles.photoQuadrant}>
                                                {match.partnerPhotoUrl ? (
                                                    <img src={match.partnerPhotoUrl} alt={match.partnerName} className={styles.photoImg} />
                                                ) : (
                                                    <div className={styles.photoAvatarInitial}>{match.partnerName.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className={`${styles.photoQuadrant} ${styles.photoQuadrantTint1}`}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </div>
                                            <div className={`${styles.photoQuadrant} ${styles.photoQuadrantTint2}`}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </div>
                                            <div className={`${styles.photoQuadrant} ${styles.photoQuadrantTint3}`}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className={styles.matchMetaBlock}>
                                            <span className={styles.matchName}>{match.partnerName}</span>
                                            <div className={styles.compatibilityPill}>
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                </svg>
                                                <span>92% Match</span>
                                            </div>

                                            <div className={styles.insightsRow}>
                                                <span className={styles.insightsHeader}>INSIGHTS</span>
                                                <div className={styles.insightsTags}>
                                                    <span className={styles.insightChip}>Friendly</span>
                                                    <span className={styles.insightChip}>Thoughtful</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.emptyMatchesNotice}>
                                No connected matches yet. Rehearse with our Generic Practice Partner!
                            </div>
                        )}

                        {/* View all matches tile */}
                        <div
                            className={styles.viewAllMatchesCard}
                            onClick={() => navigate('/connections')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate('/connections');
                                }
                            }}
                        >
                            <div className={styles.viewAllIconCircle}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <span className={styles.viewAllText}>View all matches</span>
                        </div>
                    </div>
                </section>

                {/* Section 2: Choose A Scenario */}
                <section aria-labelledby="scenario-heading" className={styles.sectionBlock}>
                    <h2 id="scenario-heading" className={styles.sectionTitle}>
                        Choose A Scenario
                    </h2>

                    {isScenariosError && (
                        <div className={styles.sectionErrorBanner} role="alert">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{scenariosErrorMessage || 'Failed to load scenarios. Using standard templates.'}</span>
                            {onRetryScenarios && (
                                <button type="button" onClick={onRetryScenarios} className={styles.retryBtn}>
                                    Retry
                                </button>
                            )}
                        </div>
                    )}

                    <div className={styles.scenariosGrid}>
                        {isLoadingScenarios && scenarios.length === 0 ? (
                            <div className={styles.loadingMatchesNotice}>Loading scenarios...</div>
                        ) : scenarios.length > 0 ? (
                            scenarios.map((scenario) => {
                                const isSelected = !isCustomScenarioActive && selectedScenarioId === scenario.id;

                                return (
                                    <button
                                        key={scenario.id}
                                        type="button"
                                        className={`${styles.scenarioButton} ${isSelected ? styles.scenarioButtonSelected : ''}`}
                                        onClick={() => handleSelectPredefinedScenario(scenario.id)}
                                    >
                                        {scenario.title}
                                    </button>
                                );
                            })
                        ) : (
                            <div className={styles.emptyNotice}>No scenarios available.</div>
                        )}
                    </div>

                    {/* Custom Scenario Textarea */}
                    <div className={`${styles.customScenarioBox} ${isCustomScenarioActive ? styles.customScenarioBoxActive : ''}`}>
                        <div className={styles.customScenarioHeader}>
                            <span className={styles.customScenarioLabel}>Custom Scenario</span>
                            {isCustomScenarioActive && (
                                <span className={styles.customActiveBadge}>Active</span>
                            )}
                        </div>
                        <textarea
                            className={styles.customScenarioTextarea}
                            placeholder="Describe any conversation or topic you want to practice (e.g. asking for space, discussing values)..."
                            value={customPrompt}
                            onChange={handleCustomPromptChange}
                            maxLength={500}
                            rows={2}
                            disabled={isStarting}
                            aria-label="Custom Scenario"
                        />
                    </div>
                </section>

                {/* Section 3: Coaching Mode Toggle */}
                <section aria-labelledby="coaching-heading" className={styles.sectionBlock}>
                    <h2 id="coaching-heading" className={styles.sectionTitle}>
                        Coaching Mode
                    </h2>
                    <div className={styles.coachingToggleRow}>
                        <div className={styles.segmentedToggle} role="group" aria-label="Coaching Mode">
                            <button
                                type="button"
                                className={`${styles.segmentedBtn} ${isCoachingEnabled ? styles.segmentedBtnActive : ''}`}
                                onClick={() => setIsCoachingEnabled(true)}
                                disabled={isStarting}
                                aria-pressed={isCoachingEnabled}
                            >
                                Coach ON
                            </button>
                            <button
                                type="button"
                                className={`${styles.segmentedBtn} ${!isCoachingEnabled ? styles.segmentedBtnActive : ''}`}
                                onClick={() => setIsCoachingEnabled(false)}
                                disabled={isStarting}
                                aria-pressed={!isCoachingEnabled}
                            >
                                Coach OFF
                            </button>
                        </div>
                    </div>
                    <p className={styles.coachingDescription}>
                        Get suggestions, conversation tips, and coaching feedback during your session.
                    </p>
                </section>

                {/* Section 4: Ready Bar (Summary Strip) */}
                <div className={styles.readyBar} aria-label="Session configuration summary">
                    <span className={styles.readyLabel}>Ready:</span>
                    <span className={styles.readyPill}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>{selectedPartner.name}</span>
                    </span>
                    <span className={styles.readyPill}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        <span>{activeScenarioTitle}</span>
                    </span>
                    <span className={styles.readyPill}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" x2="12" y1="19" y2="22" />
                        </svg>
                        <span>Coach: {isCoachingEnabled ? 'ON' : 'OFF'}</span>
                    </span>
                </div>

                {/* Primary Actions */}
                <div className={styles.actionsSection}>
                    <button
                        type="button"
                        className={styles.startButton}
                        onClick={handleStart}
                        disabled={isStarting || isLoadingScenarios || (!isCustomScenarioActive && !selectedScenarioId)}
                    >
                        {isStarting ? (
                            <>
                                <span className={styles.spinner} aria-hidden="true" />
                                <span>Starting Practice Session...</span>
                            </>
                        ) : (
                            <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                <span>Start Practice Session</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        className={styles.historyLink}
                        onClick={onViewHistory}
                    >
                        View Previous Sessions
                    </button>
                </div>
            </div>
        </div>
    );
};
