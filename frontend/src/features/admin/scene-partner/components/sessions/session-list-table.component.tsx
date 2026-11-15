import React from 'react';
import type { AdminSessionListItemDto, SceneSessionStatus, SimulationType } from '../../types/admin-scene-partner.types';
import {
    SCENE_SESSION_STATUS_LABELS,
    SESSION_STATUS_FILTER_OPTIONS,
    SIMULATION_TYPE_FILTER_OPTIONS,
} from '../../constants/admin-scene-partner.constants';
import { AdminTable, type AdminTableColumn } from '../../../../../shared/admin/components/admin-table.component';
import { AdminPagination } from '../../../../../shared/admin/components/admin-pagination.component';
import styles from './session-list-table.module.css';

export interface SessionListTableProps {
    sessions: AdminSessionListItemDto[];
    total: number;
    page: number;
    limit: number;
    isLoading: boolean;
    isFetching: boolean;
    search: string;
    statusFilter: SceneSessionStatus | '';
    simulationTypeFilter: SimulationType | '';
    onSearchChange: (search: string) => void;
    onStatusChange: (status: SceneSessionStatus | '') => void;
    onSimulationTypeChange: (type: SimulationType | '') => void;
    onResetFilters: () => void;
    onPageChange: (newPage: number) => void;
    onSelectSession: (sessionId: string) => void;
}

export const SessionListTable: React.FC<SessionListTableProps> = ({
    sessions,
    total,
    page,
    limit,
    isLoading,
    isFetching,
    search,
    statusFilter,
    simulationTypeFilter,
    onSearchChange,
    onStatusChange,
    onSimulationTypeChange,
    onResetFilters,
    onPageChange,
    onSelectSession,
}) => {
    const formatDuration = (minutes: number) => {
        if (!minutes || minutes <= 0) return '0s';
        const mins = Math.floor(minutes);
        const secs = Math.round((minutes % 1) * 60);
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const getStatusDotClass = (status: SceneSessionStatus) => {
        switch (status) {
            case 'COMPLETED':
                return styles.statusCompleted;
            case 'IN_PROGRESS':
                return styles.statusInProgress;
            case 'PAUSED':
                return styles.statusPaused;
            default:
                return styles.statusInit;
        }
    };

    const columns: AdminTableColumn<AdminSessionListItemDto>[] = [
        {
            header: 'SESSION ID',
            render: (item) => (
                <span
                    className={styles.sessionIdCell}
                    onClick={() => onSelectSession(item.id)}
                    title="Inspect session dialogue & telemetry"
                >
                    {item.id}
                </span>
            ),
        },
        {
            header: 'USER ID',
            render: (item) => (
                <span className={styles.userIdCell} title={item.userId}>
                    {item.userId}
                </span>
            ),
        },
        {
            header: 'SCENARIO',
            render: (item) => (
                <span className={styles.scenarioTitle}>
                    {item.scenarioTitle}
                </span>
            ),
        },
        {
            header: 'SIMULATION TYPE',
            render: (item) => (
                <span
                    className={`${styles.typeBadge} ${
                        item.simulationType === 'MATCH_BASED' ? styles.typeMatch : styles.typeGeneric
                    }`}
                >
                    {item.simulationType === 'MATCH_BASED' ? 'Match Based' : 'Generic'}
                </span>
            ),
        },
        {
            header: 'COACHING',
            render: (item) => (
                <span
                    className={`${styles.coachingBadge} ${
                        item.isCoachingEnabled ? styles.coachingEnabled : styles.coachingDisabled
                    }`}
                >
                    {item.isCoachingEnabled ? 'Enabled' : 'Disabled'}
                </span>
            ),
        },
        {
            header: 'STATUS',
            render: (item) => (
                <div className={styles.statusWrapper}>
                    <span className={`${styles.statusDot} ${getStatusDotClass(item.status)}`} />
                    <span>{SCENE_SESSION_STATUS_LABELS[item.status] || item.status}</span>
                </div>
            ),
        },
        {
            header: 'DURATION',
            render: (item) => (
                <span className={styles.mono}>
                    {formatDuration(item.durationMinutes)}
                </span>
            ),
        },
        {
            header: 'STARTED AT',
            render: (item) => (
                <span className={styles.mono}>
                    {new Date(item.createdAt).toLocaleString()}
                </span>
            ),
        },
        {
            header: 'ACTIONS',
            render: (item) => (
                <button
                    type="button"
                    className={styles.inspectBtn}
                    onClick={() => onSelectSession(item.id)}
                    title="Inspect transcript and timeline"
                >
                    Inspect
                </button>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.filterGroup}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by session or user ID..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Search sessions"
                    />

                    <select
                        className={styles.select}
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value as SceneSessionStatus | '')}
                        aria-label="Filter by session status"
                    >
                        {SESSION_STATUS_FILTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className={styles.select}
                        value={simulationTypeFilter}
                        onChange={(e) => onSimulationTypeChange(e.target.value as SimulationType | '')}
                        aria-label="Filter by simulation type"
                    >
                        {SIMULATION_TYPE_FILTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {(search || statusFilter || simulationTypeFilter) && (
                        <button
                            type="button"
                            className={styles.resetBtn}
                            onClick={onResetFilters}
                            title="Reset all filters"
                        >
                            RESET
                        </button>
                    )}
                </div>
            </div>

            <AdminTable<AdminSessionListItemDto>
                columns={columns}
                data={sessions}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="NO REHEARSAL SESSIONS FOUND MATCHING QUERY CRITERIA."
                onRowClick={(item) => onSelectSession(item.id)}
            />

            <AdminPagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={onPageChange}
                isLoading={isLoading || isFetching}
            />
        </div>
    );
};
