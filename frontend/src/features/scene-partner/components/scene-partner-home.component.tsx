import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetConnectionsQuery } from '../../../shared/api/connections.api';
import type { ScenarioDto, SimulationType } from '../types/scene-partner.types';
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
        scenarioId: string;
        simulationType: SimulationType;
        targetUserId?: string;
        partnerName: string;
    }) => Promise<void>;
    onViewHistory: () => void;
}

export const ScenePartnerHome: React.FC<ScenePartnerHomeProps> = ({
    scenarios,
    isLoadingScenarios = false,
    isStarting = false,
    onStartPractice,
    onViewHistory,
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

    // Selected partner state (defaults to Generic Alex)
    const [selectedPartner, setSelectedPartner] = useState<SelectedPartnerState>({
        type: 'GENERIC',
        name: 'Generic Partner (Alex)',
    });

    // Selected scenario state (defaults to first available)
    const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');

    useEffect(() => {
        if (scenarios.length > 0 && !selectedScenarioId) {
            setSelectedScenarioId(scenarios[0].id);
        }
    }, [scenarios, selectedScenarioId]);

    const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

    const handleSelectGeneric = () => {
        setSelectedPartner({
            type: 'GENERIC',
            name: 'Generic Partner (Alex)',
        });
    };

    const handleSelectMatch = (partnerId: string, partnerName: string) => {
        setSelectedPartner({
            type: 'MATCH_BASED',
            targetUserId: partnerId,
            name: partnerName,
        });
    };

    const handleStart = async () => {
        if (!selectedScenario) return;

        await onStartPractice({
            scenarioId: selectedScenario.id,
            simulationType: selectedPartner.type,
            targetUserId: selectedPartner.targetUserId,
            partnerName: selectedPartner.name,
        });
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>
                        <span className={styles.sparkleIcon} aria-hidden="true">✨</span>
                        Scene Partner
                    </h1>
                    <span className={styles.premiumBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                        Premium
                    </span>
                </div>
                <p className={styles.subtitle}>
                    Practice conversations before sending them in real life. Build confidence, explore scenarios, and prepare for meaningful connections.
                </p>
            </header>

            {/* Main Hub Card */}
            <div className={styles.hubCard}>
                {/* Section 1: Choose Practice Partner */}
                <section aria-labelledby="partner-heading">
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
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <div className={styles.genericTextCol}>
                            <span className={styles.genericTitle}>Generic Practice Partner</span>
                            <span className={styles.genericSubtitle}>Practice with a balanced conversation partner.</span>
                        </div>
                    </div>

                    {/* Match Cards Carousel */}
                    <div className={styles.matchesCarousel} role="region" aria-label="Active matches list">
                        {isLoadingConnections ? (
                            <div className={styles.emptyMatchesNotice}>Loading matches...</div>
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
                                            <div className={styles.selectedCheckmark} aria-label="Selected">
                                                ✓
                                            </div>
                                        )}

                                        <div className={styles.matchPhotoWrapper}>
                                            {match.partnerPhotoUrl ? (
                                                <img
                                                    src={match.partnerPhotoUrl}
                                                    alt={match.partnerName}
                                                    className={styles.matchPhoto}
                                                />
                                            ) : (
                                                <div className={styles.matchAvatarFallback}>
                                                    {match.partnerName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <span className={styles.matchName}>{match.partnerName}</span>
                                        <span className={styles.matchCompatibility}>Active Match</span>
                                        <span className={styles.matchTag}>Connected</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.emptyMatchesNotice}>
                                No active matches yet. You can rehearse with our Generic Practice Partner!
                            </div>
                        )}

                        {/* View all matches card */}
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
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View all matches</span>
                        </div>
                    </div>
                </section>

                {/* Section 2: Choose A Scenario */}
                <section className={styles.scenariosSection} aria-labelledby="scenario-heading">
                    <h2 id="scenario-heading" className={styles.sectionTitle}>
                        Choose A Scenario
                    </h2>

                    <div className={styles.scenariosGrid}>
                        {isLoadingScenarios ? (
                            <div className={styles.emptyMatchesNotice}>Loading scenarios...</div>
                        ) : (
                            scenarios.map((scenario) => {
                                const isSelected = selectedScenario?.id === scenario.id;

                                return (
                                    <button
                                        key={scenario.id}
                                        type="button"
                                        className={`${styles.scenarioButton} ${isSelected ? styles.scenarioButtonSelected : ''}`}
                                        onClick={() => setSelectedScenarioId(scenario.id)}
                                    >
                                        {scenario.title}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </section>

                <div className={styles.divider} role="separator" />

                {/* Ready Bar */}
                <div className={styles.readyBar} aria-label="Session configuration summary">
                    <span className={styles.readyLabel}>Ready:</span>
                    <span className={styles.readyPill}>
                        <span className={styles.readyIcon} aria-hidden="true">👤</span>
                        Practice Partner: {selectedPartner.name}
                    </span>
                    <span className={styles.readyPill}>
                        <span className={styles.readyIcon} aria-hidden="true">💬</span>
                        Scenario: {selectedScenario?.title || 'None Selected'}
                    </span>
                    <span className={styles.readyPill}>
                        <span className={styles.readyIcon} aria-hidden="true">💡</span>
                        Coach Mode: Enabled
                    </span>
                </div>

                {/* Actions */}
                <div className={styles.actionsSection}>
                    <button
                        type="button"
                        className={styles.startButton}
                        onClick={handleStart}
                        disabled={isStarting || !selectedScenario}
                    >
                        {isStarting ? (
                            <>
                                <span className={styles.spinner} aria-hidden="true" />
                                <span>Starting Session...</span>
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
