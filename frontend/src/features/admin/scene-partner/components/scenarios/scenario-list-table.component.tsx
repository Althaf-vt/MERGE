import React from 'react';
import type { AdminScenarioDto, ScenarioCategory } from '../../types/admin-scene-partner.types';
import {
    SCENARIO_CATEGORY_FILTER_OPTIONS,
    SCENARIO_CATEGORY_LABELS,
    SCENARIO_STATUS_FILTER_OPTIONS,
} from '../../constants/admin-scene-partner.constants';
import { AdminTable, type AdminTableColumn } from '../../../../../shared/admin/components/admin-table.component';
import { AdminPagination } from '../../../../../shared/admin/components/admin-pagination.component';
import styles from './scenario-list-table.module.css';

export interface ScenarioListTableProps {
    scenarios: AdminScenarioDto[];
    total: number;
    page: number;
    limit: number;
    isLoading: boolean;
    isFetching: boolean;
    search: string;
    categoryFilter: ScenarioCategory | '';
    statusFilter: '' | 'true' | 'false';
    onSearchChange: (search: string) => void;
    onCategoryChange: (category: ScenarioCategory | '') => void;
    onStatusChange: (status: '' | 'true' | 'false') => void;
    onResetFilters: () => void;
    onPageChange: (newPage: number) => void;
    onRowClick?: (scenario: AdminScenarioDto) => void;
    onEditScenario?: (scenario: AdminScenarioDto) => void;
    onToggleStatus?: (scenario: AdminScenarioDto) => void;
    onViewInDepth?: (scenarioId: string) => void;
}

export const ScenarioListTable: React.FC<ScenarioListTableProps> = ({
    scenarios,
    total,
    page,
    limit,
    isLoading,
    isFetching,
    search,
    categoryFilter,
    statusFilter,
    onSearchChange,
    onCategoryChange,
    onStatusChange,
    onResetFilters,
    onPageChange,
    onRowClick,
    onEditScenario,
    onToggleStatus,
    onViewInDepth,
}) => {
    const formatDuration = (minutes?: number | null) => {
        if (!minutes || minutes <= 0) return '--';
        const mins = Math.floor(minutes);
        const secs = Math.round((minutes % 1) * 60);
        return `${mins}m ${secs}s`;
    };

    const getCompletionClass = (rate?: number | null) => {
        if (rate === undefined || rate === null) return styles.completionMid;
        if (rate >= 80) return styles.completionHigh;
        if (rate >= 50) return styles.completionMid;
        return styles.completionLow;
    };

    const columns: AdminTableColumn<AdminScenarioDto>[] = [
        {
            header: 'SCENARIO NAME',
            render: (item) => (
                <div
                    className={styles.scenarioNameCell}
                    onClick={() => onRowClick && onRowClick(item)}
                    title="Click to inspect scenario drawer"
                >
                    <span className={styles.scenarioTitle}>{item.title}</span>
                    <span className={styles.scenarioDesc}>{item.description}</span>
                </div>
            ),
        },
        {
            header: 'CATEGORY',
            render: (item) => (
                <span className={styles.categoryBadge}>
                    {SCENARIO_CATEGORY_LABELS[item.category] || item.category}
                </span>
            ),
        },
        {
            header: 'STATUS',
            render: (item) => (
                <div className={styles.statusWrapper}>
                    <span
                        className={`${styles.statusDot} ${item.isActive ? styles.statusActive : styles.statusInactive}`}
                    />
                    <span className={item.isActive ? styles.statusTextActive : styles.statusTextInactive}>
                        {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </div>
            ),
        },
        {
            header: 'SESSIONS',
            render: (item) => (
                <span className={styles.mono}>
                    {item.summary?.totalSessions?.toLocaleString() ?? 0}
                </span>
            ),
        },
        {
            header: 'AVG DURATION',
            render: (item) => (
                <span className={styles.mono}>
                    {formatDuration(item.summary?.averageDurationMinutes)}
                </span>
            ),
        },
        {
            header: 'COMPLETION',
            render: (item) => {
                const rate = item.summary?.completionRate;
                return (
                    <span className={`${styles.mono} ${getCompletionClass(rate)}`}>
                        {rate !== undefined && rate !== null ? `${rate.toFixed(1)}%` : '--'}
                    </span>
                );
            },
        },
        {
            header: 'CREATED',
            render: (item) => (
                <span className={styles.mono}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: 'ACTIONS',
            render: (item) => (
                <div className={styles.actionsGroup}>
                    {onEditScenario && (
                        <button
                            type="button"
                            className={styles.actionIconBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditScenario(item);
                            }}
                            title="Edit Scenario"
                            aria-label={`Edit ${item.title}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                        </button>
                    )}
                    {onToggleStatus && (
                        <button
                            type="button"
                            className={`${styles.actionIconBtn} ${item.isActive ? styles.actionIconBtnDanger : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(item);
                            }}
                            title={item.isActive ? 'Disable Scenario' : 'Enable Scenario'}
                            aria-label={item.isActive ? `Disable ${item.title}` : `Enable ${item.title}`}
                        >
                            {item.isActive ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            )}
                        </button>
                    )}
                    {onViewInDepth && (
                        <button
                            type="button"
                            className={styles.actionIconBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewInDepth(item.id);
                            }}
                            title="View In-Depth Analytics"
                            aria-label={`View in-depth analytics for ${item.title}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    )}
                </div>
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
                        placeholder="Search scenario by name..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Search scenarios"
                    />

                    <select
                        className={styles.select}
                        value={categoryFilter}
                        onChange={(e) => onCategoryChange(e.target.value as ScenarioCategory | '')}
                        aria-label="Filter by category"
                    >
                        {SCENARIO_CATEGORY_FILTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className={styles.select}
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value as '' | 'true' | 'false')}
                        aria-label="Filter by active status"
                    >
                        {SCENARIO_STATUS_FILTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {(search || categoryFilter || statusFilter) && (
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

            <AdminTable<AdminScenarioDto>
                columns={columns}
                data={scenarios}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="NO SCENARIOS FOUND MATCHING FILTER CRITERIA."
                onRowClick={onRowClick}
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
