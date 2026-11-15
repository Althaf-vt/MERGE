import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import { AdminTable, type AdminTableColumn } from '../../../../shared/admin/components/admin-table.component';
import {
    useGetAdminScenarioInDepthQuery,
    useGetAdminScenarioActivityHistoryQuery,
} from '../api/admin-scene-partner.api';
import type {
    AdminAuditLogDto,
    AdminScenarioDto,
    AdminSessionListItemDto,
    ScenarioCategory,
    ScenarioTimeframe,
} from '../types/admin-scene-partner.types';
import {
    SCENARIO_CATEGORY_LABELS,
    SCENE_SESSION_STATUS_LABELS,
} from '../constants/admin-scene-partner.constants';
import { MetricCard } from '../components/shared/metric-card.component';
import { AnalyticsChart } from '../components/analytics/analytics-chart.component';
import { ScenarioFormModal } from '../components/scenarios/scenario-form-modal.component';
import { ScenarioStatusModal } from '../components/scenarios/scenario-status-modal.component';
import { SessionDetailDrawer } from '../components/sessions/session-detail-drawer.component';
import { PreviewSimulationModal } from '../components/preview/preview-simulation-modal.component';
import styles from './scenario-detail.module.css';

type BottomTab = 'SESSIONS' | 'AUDIT_LOG';

export const ScenarioDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [timeframe, setTimeframe] = useState<ScenarioTimeframe>('30D');
    const [bottomTab, setBottomTab] = useState<BottomTab>('SESSIONS');
    const [copied, setCopied] = useState(false);

    // Modals & drawers state.
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewDraft, setPreviewDraft] = useState<{
        title?: string;
        category?: ScenarioCategory;
        promptContext?: string;
    } | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    // In-depth scenario telemetry query.
    const {
        data: inDepthRes,
        isLoading: isInDepthLoading,
        isFetching: isInDepthFetching,
        refetch: refetchInDepth,
    } = useGetAdminScenarioInDepthQuery(
        { id: id || '', query: { timeframe } },
        { skip: !id }
    );

    // Chronological audit log query.
    const {
        data: auditRes,
        isLoading: isAuditLoading,
        refetch: refetchAudit,
    } = useGetAdminScenarioActivityHistoryQuery(
        { id: id || '' },
        { skip: !id }
    );

    const scenario: AdminScenarioDto | undefined = inDepthRes?.data?.scenario;
    const summary = inDepthRes?.data?.summary;
    const trends = inDepthRes?.data?.trends || [];
    const recentSessions: AdminSessionListItemDto[] = inDepthRes?.data?.recentSessions || [];
    const auditLogs: AdminAuditLogDto[] = auditRes?.data || [];

    const handleCopyPrompt = async () => {
        if (!scenario?.promptContext) return;
        try {
            await navigator.clipboard.writeText(scenario.promptContext);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy prompt context:', err);
        }
    };

    const formatDuration = (minutes?: number | null) => {
        if (!minutes || minutes <= 0) return '--';
        const mins = Math.floor(minutes);
        const secs = Math.round((minutes % 1) * 60);
        return `${mins}m ${secs}s`;
    };

    const sessionColumns: AdminTableColumn<AdminSessionListItemDto>[] = [
        {
            header: 'SESSION ID',
            render: (s) => (
                <span style={{ fontFamily: 'monospace', fontSize: '11px' }} title={s.id}>
                    {s.id.slice(0, 8)}...
                </span>
            ),
        },
        {
            header: 'USER ID',
            render: (s) => (
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--admin-text-subtle)' }} title={s.userId}>
                    {s.userId.slice(0, 8)}...
                </span>
            ),
        },
        {
            header: 'PARTNER TYPE',
            render: (s) => (
                <span style={{ fontSize: '11px', color: s.simulationType === 'MATCH_BASED' ? 'var(--admin-accent-text)' : 'inherit' }}>
                    {s.simulationType}
                </span>
            ),
        },
        {
            header: 'COACHING',
            render: (s) => (
                <span style={{ fontSize: '11px', color: s.isCoachingEnabled ? '#4ade80' : 'var(--admin-text-subtle)' }}>
                    {s.isCoachingEnabled ? 'ENABLED' : 'OFF'}
                </span>
            ),
        },
        {
            header: 'STATUS',
            render: (s) => (
                <span style={{ fontSize: '11px', fontWeight: 600 }}>
                    {SCENE_SESSION_STATUS_LABELS[s.status] || s.status}
                </span>
            ),
        },
        {
            header: 'TURNS',
            render: (s) => s.turnCount,
        },
        {
            header: 'DURATION',
            render: (s) => formatDuration(s.durationMinutes),
        },
        {
            header: 'STARTED AT',
            render: (s) => new Date(s.createdAt).toLocaleDateString(),
        },
        {
            header: 'ACTION',
            render: (s) => (
                <button
                    type="button"
                    className={styles.actionCellBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSessionId(s.id);
                    }}
                >
                    INSPECT
                </button>
            ),
        },
    ];

    if (isInDepthLoading) {
        return (
            <AdminPageTransition>
                <div className={styles.container}>
                    <div className={styles.loadingContainer}>INITIALIZING SCENARIO TELEMETRY STREAM...</div>
                </div>
            </AdminPageTransition>
        );
    }

    if (!scenario) {
        return (
            <AdminPageTransition>
                <div className={styles.container}>
                    <div className={styles.breadcrumbRow}>
                        <button type="button" className={styles.backBtn} onClick={() => navigate('/admin/scene-partner')}>
                            &larr; BACK TO SCENARIOS
                        </button>
                    </div>
                    <div className={styles.emptyState}>SCENARIO RECORD NOT FOUND OR INVALID IDENTIFIER.</div>
                </div>
            </AdminPageTransition>
        );
    }

    return (
        <AdminPageTransition>
            <div className={styles.container}>
                <div className={styles.breadcrumbRow}>
                    <button type="button" className={styles.backBtn} onClick={() => navigate('/admin/scene-partner')}>
                        &larr; BACK TO SCENARIOS
                    </button>
                </div>

                <header className={styles.header}>
                    <div className={styles.titleArea}>
                        <h1 className={styles.title}>{scenario.title}</h1>
                        <div className={styles.badgesRow}>
                            <span className={styles.categoryBadge}>
                                {SCENARIO_CATEGORY_LABELS[scenario.category]}
                            </span>
                            <span className={scenario.isActive ? styles.statusActive : styles.statusInactive}>
                                <span style={{ fontSize: '8px' }}>●</span> {scenario.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                            {scenario.isCustom && <span className={styles.customBadge}>CUSTOM USER SCENARIO</span>}
                        </div>
                    </div>

                    <div className={styles.headerActions}>
                        <button
                            type="button"
                            className={scenario.isActive ? styles.btnWarning : styles.btnSuccess}
                            onClick={() => setIsStatusModalOpen(true)}
                        >
                            {scenario.isActive ? 'DISABLE SCENARIO' : 'ENABLE SCENARIO'}
                        </button>

                        <button
                            type="button"
                            className={styles.btnSecondary}
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            EDIT SCENARIO
                        </button>

                        <button
                            type="button"
                            className={styles.btnPrimary}
                            onClick={() => {
                                setPreviewDraft(null);
                                setIsPreviewOpen(true);
                            }}
                        >
                            TEST IN PREVIEW
                        </button>
                    </div>
                </header>

                <div className={styles.mainGrid}>
                    <div className={styles.column}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Configuration Profile</h3>
                            </div>
                            <p className={styles.descriptionText}>{scenario.description}</p>

                            <div className={styles.promptContainer}>
                                <div className={styles.promptHeader}>
                                    <span className={styles.promptLabel}>AI Prompt Context</span>
                                    <button type="button" className={styles.copyBtn} onClick={handleCopyPrompt}>
                                        {copied ? 'COPIED!' : 'COPY'}
                                    </button>
                                </div>
                                <div className={styles.promptBlock}>{scenario.promptContext}</div>
                            </div>

                            <div className={styles.metaGrid}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>SCENARIO ID</span>
                                    <span className={styles.metaValue}>{scenario.id}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>TYPE</span>
                                    <span className={styles.metaValue}>{scenario.isCustom ? 'User Custom' : 'Platform Seeded'}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>CREATED ON</span>
                                    <span className={styles.metaValue}>{new Date(scenario.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>LAST UPDATED</span>
                                    <span className={styles.metaValue}>{new Date(scenario.updatedAt).toLocaleDateString()}</span>
                                </div>
                                {scenario.creatorUserId && (
                                    <div className={styles.metaItem} style={{ gridColumn: 'span 2' }}>
                                        <span className={styles.metaLabel}>CREATOR USER ID</span>
                                        <span className={styles.metaValue}>{scenario.creatorUserId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <div className={styles.kpiGrid}>
                            <MetricCard
                                title="Total Sessions"
                                value={(summary?.totalSessions ?? 0).toLocaleString()}
                                subtitle={`${(summary?.completedSessions ?? 0).toLocaleString()} completed`}
                                isLoading={isInDepthLoading}
                            />
                            <MetricCard
                                title="Completion Rate"
                                value={`${(summary?.completionRate ?? 0).toFixed(1)}%`}
                                subtitle="Benchmark target: 70%"
                                trend={{
                                    value: `${(summary?.completionRate ?? 0).toFixed(0)}%`,
                                    direction: (summary?.completionRate ?? 0) >= 70 ? 'up' : 'down',
                                    isPositive: (summary?.completionRate ?? 0) >= 70,
                                }}
                                isLoading={isInDepthLoading}
                            />
                            <MetricCard
                                title="Avg Duration"
                                value={formatDuration(summary?.averageDurationMinutes)}
                                subtitle="Per rehearsal"
                                isLoading={isInDepthLoading}
                            />
                            <MetricCard
                                title="Coaching Adoption"
                                value={`${(summary?.coachingAdoptionRate ?? 0).toFixed(1)}%`}
                                subtitle={`Avg ${(summary?.averageTurnCount ?? 0).toFixed(1)} turns/session`}
                                isLoading={isInDepthLoading}
                            />
                        </div>

                        <AnalyticsChart
                            data={trends}
                            timeframe={timeframe}
                            onTimeframeChange={setTimeframe}
                            isLoading={isInDepthFetching}
                        />
                    </div>
                </div>

                <div className={styles.bottomSection}>
                    <nav className={styles.bottomNav} aria-label="Scenario Sub-tabs">
                        <button
                            type="button"
                            className={`${styles.bottomTabBtn} ${bottomTab === 'SESSIONS' ? styles.bottomTabBtnActive : ''}`}
                            onClick={() => setBottomTab('SESSIONS')}
                        >
                            RECENT REHEARSALS ({recentSessions.length})
                        </button>
                        <button
                            type="button"
                            className={`${styles.bottomTabBtn} ${bottomTab === 'AUDIT_LOG' ? styles.bottomTabBtnActive : ''}`}
                            onClick={() => setBottomTab('AUDIT_LOG')}
                        >
                            AUDIT LOG ({auditLogs.length})
                        </button>
                    </nav>

                    {bottomTab === 'SESSIONS' && (
                        <AdminTable
                            columns={sessionColumns}
                            data={recentSessions}
                            keyExtractor={(item) => item.id}
                            isLoading={isInDepthLoading}
                            isFetching={isInDepthFetching}
                            emptyMessage="NO RECENT REHEARSAL SESSIONS RECORDED FOR THIS SCENARIO."
                            onRowClick={(item) => setSelectedSessionId(item.id)}
                        />
                    )}

                    {bottomTab === 'AUDIT_LOG' && (
                        <div className={styles.auditList}>
                            {isAuditLoading && (
                                <div className={styles.emptyState}>STREAMING AUDIT HISTORY...</div>
                            )}

                            {!isAuditLoading && auditLogs.length === 0 && (
                                <div className={styles.emptyState}>NO AUDIT LOG EVENTS RECORDED FOR THIS SCENARIO.</div>
                            )}

                            {!isAuditLoading &&
                                auditLogs.map((log) => (
                                    <div key={log.id} className={styles.auditEntry}>
                                        <div className={styles.auditHeader}>
                                            <span className={styles.auditAction}>{log.action}</span>
                                            <span className={styles.auditTimestamp}>
                                                {new Date(log.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className={styles.auditMeta}>
                                            <span>
                                                ADMIN:{' '}
                                                <span className={styles.auditAdmin}>
                                                    {log.adminEmail || log.adminName || log.adminId}
                                                </span>
                                            </span>
                                            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                                        </div>
                                        {log.details && (
                                            <div className={styles.auditDetails}>
                                                {JSON.stringify(log.details, null, 2)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <ScenarioFormModal
                    isOpen={isEditModalOpen}
                    scenario={scenario}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        refetchInDepth();
                        refetchAudit();
                    }}
                    onOpenPreview={(draft) => {
                        setPreviewDraft(draft);
                        setIsPreviewOpen(true);
                    }}
                />

                <ScenarioStatusModal
                    isOpen={isStatusModalOpen}
                    scenario={scenario}
                    onClose={() => setIsStatusModalOpen(false)}
                    onSuccess={() => {
                        setIsStatusModalOpen(false);
                        refetchInDepth();
                        refetchAudit();
                    }}
                />

                <SessionDetailDrawer
                    isOpen={Boolean(selectedSessionId)}
                    sessionId={selectedSessionId}
                    onClose={() => setSelectedSessionId(null)}
                />

                <PreviewSimulationModal
                    isOpen={isPreviewOpen}
                    scenarioId={scenario.id}
                    draftScenario={previewDraft}
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setPreviewDraft(null);
                    }}
                />
            </div>
        </AdminPageTransition>
    );
};
