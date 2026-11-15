import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import {
    useGetAdminScenariosQuery,
    useGetAdminSessionsQuery,
    useGetScenePartnerAnalyticsQuery,
    useLazyExportScenariosQuery,
} from '../api/admin-scene-partner.api';
import type {
    AdminScenarioDto,
    SceneSessionStatus,
    ScenarioCategory,
    SimulationType,
} from '../types/admin-scene-partner.types';
import { DEFAULT_PAGE_LIMIT } from '../constants/admin-scene-partner.constants';
import { MetricCard } from '../components/shared/metric-card.component';
import { ScenarioListTable } from '../components/scenarios/scenario-list-table.component';
import { ScenarioDrawer } from '../components/scenarios/scenario-drawer.component';
import { ScenarioFormModal } from '../components/scenarios/scenario-form-modal.component';
import { ScenarioStatusModal } from '../components/scenarios/scenario-status-modal.component';
import { SessionListTable } from '../components/sessions/session-list-table.component';
import { SessionDetailDrawer } from '../components/sessions/session-detail-drawer.component';
import { AnalyticsOverview } from '../components/analytics/analytics-overview.component';
import { PreviewSimulationModal } from '../components/preview/preview-simulation-modal.component';
import styles from './scene-partner-management.module.css';

type ActiveTab = 'SCENARIOS' | 'SESSIONS' | 'ANALYTICS';

export const ScenePartnerManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ActiveTab>('SCENARIOS');

    // Scenarios Tab state.
    const [scenarioPage, setScenarioPage] = useState(1);
    const [scenarioSearch, setScenarioSearch] = useState('');
    const [scenarioCategoryFilter, setScenarioCategoryFilter] = useState<ScenarioCategory | ''>('');
    const [scenarioStatusFilter, setScenarioStatusFilter] = useState<'' | 'true' | 'false'>('');

    // Sessions Tab state.
    const [sessionPage, setSessionPage] = useState(1);
    const [sessionSearch, setSessionSearch] = useState('');
    const [sessionStatusFilter, setSessionStatusFilter] = useState<SceneSessionStatus | ''>('');
    const [sessionTypeFilter, setSessionTypeFilter] = useState<SimulationType | ''>('');

    // Modal & Drawer visibility state.
    const [drawerScenario, setDrawerScenario] = useState<AdminScenarioDto | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingScenario, setEditingScenario] = useState<AdminScenarioDto | null>(null);
    const [statusModalScenario, setStatusModalScenario] = useState<AdminScenarioDto | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    // AI Simulation Sandbox modal state.
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewScenarioId, setPreviewScenarioId] = useState<string | undefined>(undefined);
    const [previewDraft, setPreviewDraft] = useState<{
        title?: string;
        category?: ScenarioCategory;
        promptContext?: string;
    } | null>(null);

    // Scenarios query.
    const {
        data: scenariosData,
        isLoading: isScenariosLoading,
        isFetching: isScenariosFetching,
        refetch: refetchScenarios,
    } = useGetAdminScenariosQuery({
        page: scenarioPage,
        limit: DEFAULT_PAGE_LIMIT,
        search: scenarioSearch || undefined,
        category: scenarioCategoryFilter || undefined,
        isActive: scenarioStatusFilter === '' ? undefined : scenarioStatusFilter === 'true',
    });

    // Sessions query.
    const {
        data: sessionsData,
        isLoading: isSessionsLoading,
        isFetching: isSessionsFetching,
        refetch: refetchSessions,
    } = useGetAdminSessionsQuery({
        page: sessionPage,
        limit: DEFAULT_PAGE_LIMIT,
        scenarioId: sessionSearch || undefined,
        status: sessionStatusFilter || undefined,
        simulationType: sessionTypeFilter || undefined,
    });

    // Analytics query.
    const {
        data: analyticsData,
        isLoading: isAnalyticsLoading,
        isFetching: isAnalyticsFetching,
        refetch: refetchAnalytics,
    } = useGetScenePartnerAnalyticsQuery();

    // Export query trigger.
    const [triggerExport, { isFetching: isExporting }] = useLazyExportScenariosQuery();

    const scenarios = scenariosData?.data || [];
    const totalScenarios = scenariosData?.meta?.total || 0;
    const activeScenariosCount = scenarios.filter((s) => s.isActive).length;

    const sessions = sessionsData?.data || [];
    const totalSessions = sessionsData?.meta?.total || 0;

    const analytics = analyticsData?.data;

    const handleRefreshAll = () => {
        refetchScenarios();
        refetchSessions();
        refetchAnalytics();
    };

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const response = await triggerExport({ format }).unwrap();

            if (format === 'csv') {
                const csvContent =
                    typeof response === 'string'
                        ? response
                        : typeof (response as unknown as { data?: unknown }).data === 'string'
                          ? ((response as unknown as { data: string }).data)
                          : '';

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `merge-scenarios-export-${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                const exportData =
                    typeof response === 'object' && response !== null && 'data' in response
                        ? (response as { data?: unknown[] }).data || []
                        : Array.isArray(response)
                          ? response
                          : [];

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `merge-scenarios-export-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Scenario export error:', err);
        }
    };

    const isGlobalRefreshing = isScenariosFetching || isSessionsFetching || isAnalyticsFetching;

    return (
        <AdminPageTransition>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.titleArea}>
                        <h1 className={styles.title}>Scene Partner Management</h1>
                        <span className={styles.subtitle}>
                            Manage AI rehearsal scenarios, inspect user sessions & analyze coaching performance
                        </span>
                    </div>

                    <div className={styles.headerControls}>
                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={handleRefreshAll}
                            disabled={isGlobalRefreshing}
                        >
                            {isGlobalRefreshing ? 'REFRESHING...' : 'REFRESH'}
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => handleExport('csv')}
                            disabled={isExporting}
                        >
                            {isExporting ? 'EXPORTING...' : 'EXPORT CSV'}
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => handleExport('json')}
                            disabled={isExporting}
                        >
                            {isExporting ? 'EXPORTING...' : 'EXPORT JSON'}
                        </button>

                        <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={() => {
                                setEditingScenario(null);
                                setIsFormModalOpen(true);
                            }}
                        >
                            + CREATE SCENARIO
                        </button>
                    </div>
                </header>

                <nav className={styles.tabNavigation} aria-label="Scene Partner Tabs">
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === 'SCENARIOS' ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab('SCENARIOS')}
                    >
                        SCENARIOS
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === 'SESSIONS' ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab('SESSIONS')}
                    >
                        SESSIONS
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === 'ANALYTICS' ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab('ANALYTICS')}
                    >
                        ANALYTICS
                    </button>
                </nav>

                <main className={styles.tabContent}>
                    {activeTab === 'SCENARIOS' && (
                        <>
                            <section className={styles.kpiRow}>
                                <MetricCard
                                    title="Total Scenarios"
                                    value={totalScenarios.toLocaleString()}
                                    subtitle="Catalog catalogued"
                                    isLoading={isScenariosLoading}
                                />
                                <MetricCard
                                    title="Active Scenarios"
                                    value={activeScenariosCount.toLocaleString()}
                                    subtitle="Listed for rehearsals"
                                    isLoading={isScenariosLoading}
                                />
                                <MetricCard
                                    title="Total Sessions"
                                    value={(analytics?.totalSessions ?? 0).toLocaleString()}
                                    subtitle="Rehearsals conducted"
                                    isLoading={isAnalyticsLoading}
                                />
                                <MetricCard
                                    title="Avg Completion"
                                    value={`${(analytics?.completionRate ?? 0).toFixed(1)}%`}
                                    subtitle="Platform average"
                                    isLoading={isAnalyticsLoading}
                                />
                            </section>

                            <ScenarioListTable
                                scenarios={scenarios}
                                total={totalScenarios}
                                page={scenarioPage}
                                limit={DEFAULT_PAGE_LIMIT}
                                isLoading={isScenariosLoading}
                                isFetching={isScenariosFetching}
                                search={scenarioSearch}
                                categoryFilter={scenarioCategoryFilter}
                                statusFilter={scenarioStatusFilter}
                                onSearchChange={(s) => {
                                    setScenarioSearch(s);
                                    setScenarioPage(1);
                                }}
                                onCategoryChange={(cat) => {
                                    setScenarioCategoryFilter(cat);
                                    setScenarioPage(1);
                                }}
                                onStatusChange={(st) => {
                                    setScenarioStatusFilter(st);
                                    setScenarioPage(1);
                                }}
                                onResetFilters={() => {
                                    setScenarioSearch('');
                                    setScenarioCategoryFilter('');
                                    setScenarioStatusFilter('');
                                    setScenarioPage(1);
                                }}
                                onPageChange={setScenarioPage}
                                onRowClick={(scenario) => setDrawerScenario(scenario)}
                                onEditScenario={(scenario) => {
                                    setEditingScenario(scenario);
                                    setIsFormModalOpen(true);
                                }}
                                onToggleStatus={(scenario) => setStatusModalScenario(scenario)}
                                onViewInDepth={(id) => navigate(`/admin/scene-partner/scenarios/${id}`)}
                            />
                        </>
                    )}

                    {activeTab === 'SESSIONS' && (
                        <SessionListTable
                            sessions={sessions}
                            total={totalSessions}
                            page={sessionPage}
                            limit={DEFAULT_PAGE_LIMIT}
                            isLoading={isSessionsLoading}
                            isFetching={isSessionsFetching}
                            search={sessionSearch}
                            statusFilter={sessionStatusFilter}
                            simulationTypeFilter={sessionTypeFilter}
                            onSearchChange={(s) => {
                                setSessionSearch(s);
                                setSessionPage(1);
                            }}
                            onStatusChange={(st) => {
                                setSessionStatusFilter(st);
                                setSessionPage(1);
                            }}
                            onSimulationTypeChange={(tp) => {
                                setSessionTypeFilter(tp);
                                setSessionPage(1);
                            }}
                            onResetFilters={() => {
                                setSessionSearch('');
                                setSessionStatusFilter('');
                                setSessionTypeFilter('');
                                setSessionPage(1);
                            }}
                            onPageChange={setSessionPage}
                            onSelectSession={(id) => setSelectedSessionId(id)}
                        />
                    )}

                    {activeTab === 'ANALYTICS' && (
                        <AnalyticsOverview analytics={analytics} isLoading={isAnalyticsLoading} />
                    )}
                </main>

                <ScenarioDrawer
                    isOpen={Boolean(drawerScenario)}
                    scenario={drawerScenario}
                    onClose={() => setDrawerScenario(null)}
                    onEdit={(scenario) => {
                        setDrawerScenario(null);
                        setEditingScenario(scenario);
                        setIsFormModalOpen(true);
                    }}
                    onToggleStatus={(scenario) => {
                        setDrawerScenario(null);
                        setStatusModalScenario(scenario);
                    }}
                    onOpenPreview={(scenario) => {
                        setDrawerScenario(null);
                        setPreviewScenarioId(scenario.id);
                        setPreviewDraft(null);
                        setIsPreviewOpen(true);
                    }}
                    onViewInDepth={(id) => navigate(`/admin/scene-partner/scenarios/${id}`)}
                />

                <ScenarioFormModal
                    isOpen={isFormModalOpen}
                    scenario={editingScenario}
                    onClose={() => {
                        setIsFormModalOpen(false);
                        setEditingScenario(null);
                    }}
                    onSuccess={() => {
                        setIsFormModalOpen(false);
                        setEditingScenario(null);
                        refetchScenarios();
                    }}
                    onOpenPreview={(draft) => {
                        setPreviewScenarioId(draft.scenarioId);
                        setPreviewDraft(draft);
                        setIsPreviewOpen(true);
                    }}
                />

                <ScenarioStatusModal
                    isOpen={Boolean(statusModalScenario)}
                    scenario={statusModalScenario}
                    onClose={() => setStatusModalScenario(null)}
                    onSuccess={() => {
                        setStatusModalScenario(null);
                        refetchScenarios();
                    }}
                />

                <SessionDetailDrawer
                    isOpen={Boolean(selectedSessionId)}
                    sessionId={selectedSessionId}
                    onClose={() => setSelectedSessionId(null)}
                />

                <PreviewSimulationModal
                    isOpen={isPreviewOpen}
                    scenarioId={previewScenarioId}
                    draftScenario={previewDraft}
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setPreviewScenarioId(undefined);
                        setPreviewDraft(null);
                    }}
                />
            </div>
        </AdminPageTransition>
    );
};
