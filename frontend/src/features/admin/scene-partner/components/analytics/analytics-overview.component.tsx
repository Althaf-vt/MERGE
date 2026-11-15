import React from 'react';
import type { ScenePartnerAnalyticsDto } from '../../types/admin-scene-partner.types';
import { SCENARIO_CATEGORY_LABELS } from '../../constants/admin-scene-partner.constants';
import { MetricCard } from '../shared/metric-card.component';
import styles from './analytics-overview.module.css';

export interface AnalyticsOverviewProps {
    analytics?: ScenePartnerAnalyticsDto | null;
    isLoading?: boolean;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
    analytics,
    isLoading = false,
}) => {
    const total = analytics?.totalSessions ?? 0;
    const completed = analytics?.completedSessions ?? 0;
    const inProgress = analytics?.inProgressSessions ?? 0;
    const paused = analytics?.pausedSessions ?? 0;
    const completionRate = analytics?.completionRate ?? 0;
    const coachingAdoption = analytics?.coachingAdoptionRate ?? 0;
    const avgTurns = analytics?.averageTurnCount ?? 0;

    const coachingEnabled = analytics?.coachingEnabledCount ?? 0;
    const coachingDisabled = analytics?.coachingDisabledCount ?? 0;
    const coachingTotal = coachingEnabled + coachingDisabled;
    const coachingEnabledPct = coachingTotal > 0 ? (coachingEnabled / coachingTotal) * 100 : 0;

    const genericCount = analytics?.genericCount ?? 0;
    const matchCount = analytics?.matchBasedCount ?? 0;
    const simTotal = genericCount + matchCount;
    const matchPct = simTotal > 0 ? (matchCount / simTotal) * 100 : 0;

    const topScenarios = analytics?.topScenarios ?? [];
    const maxScenarioCount = topScenarios.length > 0 ? Math.max(...topScenarios.map((s) => s.count), 1) : 1;

    const categoryDistribution = analytics?.categoryDistribution ?? [];

    return (
        <div className={styles.container}>
            <div className={styles.kpiGrid}>
                <MetricCard
                    title="Total Rehearsal Sessions"
                    value={total.toLocaleString()}
                    subtitle={`Active: ${inProgress} • Paused: ${paused}`}
                    isLoading={isLoading}
                />
                <MetricCard
                    title="Completion Rate"
                    value={`${completionRate.toFixed(1)}%`}
                    subtitle={`${completed.toLocaleString()} completed of ${total.toLocaleString()}`}
                    trend={{
                        value: `${completionRate.toFixed(0)}%`,
                        direction: completionRate >= 70 ? 'up' : 'down',
                        isPositive: completionRate >= 70,
                    }}
                    isLoading={isLoading}
                />
                <MetricCard
                    title="Coaching Mode Adoption"
                    value={`${coachingAdoption.toFixed(1)}%`}
                    subtitle={`${coachingEnabled.toLocaleString()} with AI tips active`}
                    isLoading={isLoading}
                />
                <MetricCard
                    title="Average Dialogue Depth"
                    value={`${avgTurns.toFixed(1)} turns`}
                    subtitle="Turn count per session"
                    isLoading={isLoading}
                />
            </div>

            <div className={styles.breakdownGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Top Practiced Scenarios</h3>
                    </div>

                    {topScenarios.length === 0 ? (
                        <div className={styles.emptyNotice}>
                            {isLoading ? 'LOADING RANKINGS...' : 'NO SCENARIO USAGE RECORDED YET.'}
                        </div>
                    ) : (
                        <div className={styles.rankingList}>
                            {topScenarios.slice(0, 5).map((scenario, index) => {
                                const pct = (scenario.count / maxScenarioCount) * 100;
                                return (
                                    <div key={scenario.scenarioId || `top-${index}`} className={styles.rankingItem}>
                                        <div className={styles.rankingHeader}>
                                            <div>
                                                <span className={styles.scenarioName}>{scenario.scenarioTitle}</span>
                                                <span className={styles.scenarioCategory}>
                                                    ({SCENARIO_CATEGORY_LABELS[scenario.category] || scenario.category})
                                                </span>
                                            </div>
                                            <span className={styles.scenarioCount}>
                                                {scenario.count.toLocaleString()} sessions
                                            </span>
                                        </div>
                                        <div className={styles.progressBarTrack}>
                                            <div
                                                className={styles.progressBarFill}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Category Distribution</h3>
                    </div>

                    {categoryDistribution.length === 0 ? (
                        <div className={styles.emptyNotice}>
                            {isLoading ? 'LOADING CATEGORIES...' : 'NO CATEGORY DATA AVAILABLE.'}
                        </div>
                    ) : (
                        <div className={styles.categoryGrid}>
                            {categoryDistribution.map((item) => (
                                <div key={item.category} className={styles.categoryRow}>
                                    <span className={styles.categoryLabel}>
                                        {SCENARIO_CATEGORY_LABELS[item.category] || item.category}
                                    </span>
                                    <span className={styles.categoryCount}>
                                        {item.count.toLocaleString()} sessions
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.breakdownGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Simulation Type Breakdown</h3>
                    </div>

                    <div className={styles.distributionSection}>
                        <div className={styles.ratioHeader}>
                            <span>Generic Rehearsal vs Match-Based Simulation</span>
                            <span style={{ color: 'var(--admin-accent-text)' }}>
                                {matchPct.toFixed(1)}% Match-Based
                            </span>
                        </div>

                        <div className={styles.ratioBar}>
                            <div className={styles.ratioFillAccent} style={{ width: `${matchPct}%` }} />
                            <div className={styles.ratioFillSubtle} style={{ width: `${100 - matchPct}%` }} />
                        </div>

                        <div className={styles.ratioLegend}>
                            <span>Match Based: {matchCount.toLocaleString()}</span>
                            <span>Generic: {genericCount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Real-Time Coaching Usage</h3>
                    </div>

                    <div className={styles.distributionSection}>
                        <div className={styles.ratioHeader}>
                            <span>Coaching Feedback Enabled vs Disabled</span>
                            <span style={{ color: 'var(--badge-active-text)' }}>
                                {coachingEnabledPct.toFixed(1)}% Active Feedback
                            </span>
                        </div>

                        <div className={styles.ratioBar}>
                            <div className={styles.ratioFillSuccess} style={{ width: `${coachingEnabledPct}%` }} />
                            <div className={styles.ratioFillSubtle} style={{ width: `${100 - coachingEnabledPct}%` }} />
                        </div>

                        <div className={styles.ratioLegend}>
                            <span>Enabled: {coachingEnabled.toLocaleString()}</span>
                            <span>Disabled: {coachingDisabled.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
