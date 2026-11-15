import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AdminScenarioDto } from '../../types/admin-scene-partner.types';
import { SCENARIO_CATEGORY_LABELS } from '../../constants/admin-scene-partner.constants';
import styles from './scenario-drawer.module.css';

export interface ScenarioDrawerProps {
    isOpen: boolean;
    scenario: AdminScenarioDto | null;
    onClose: () => void;
    onEdit?: (scenario: AdminScenarioDto) => void;
    onToggleStatus?: (scenario: AdminScenarioDto) => void;
    onOpenPreview?: (scenario: AdminScenarioDto) => void;
    onViewInDepth?: (scenarioId: string) => void;
}

export const ScenarioDrawer: React.FC<ScenarioDrawerProps> = ({
    isOpen,
    scenario,
    onClose,
    onEdit,
    onToggleStatus,
    onOpenPreview,
    onViewInDepth,
}) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen || !scenario) return null;

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(scenario.promptContext);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <AnimatePresence>
            <div className={styles.backdrop} onClick={onClose}>
                <motion.div
                    className={styles.drawer}
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Scenario details for ${scenario.title}`}
                >
                    <div className={styles.header}>
                        <div className={styles.titleArea}>
                            <h2 className={styles.title}>{scenario.title}</h2>
                            <div className={styles.badgeRow}>
                                <span className={styles.categoryBadge}>
                                    {SCENARIO_CATEGORY_LABELS[scenario.category] || scenario.category}
                                </span>
                                <div className={styles.statusWrapper}>
                                    <span
                                        className={`${styles.statusDot} ${scenario.isActive ? styles.statusActive : styles.statusInactive}`}
                                    />
                                    <span style={{ color: scenario.isActive ? 'var(--badge-active-text)' : 'var(--badge-suspend-text)' }}>
                                        {scenario.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={onClose}
                            title="Close drawer (Esc)"
                            aria-label="Close drawer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div className={styles.body}>
                        <div>
                            <h3 className={styles.sectionTitle}>Performance Metrics</h3>
                            <div className={styles.metricsGrid}>
                                <div className={styles.metricTile}>
                                    <span className={styles.metricLabel}>Lifetime Sessions</span>
                                    <span className={styles.metricValue}>
                                        {scenario.summary?.totalSessions?.toLocaleString() ?? 0}
                                    </span>
                                </div>
                                <div className={styles.metricTile}>
                                    <span className={styles.metricLabel}>Avg Completion</span>
                                    <span className={styles.metricValue}>
                                        {scenario.summary?.completionRate !== undefined
                                            ? `${scenario.summary.completionRate.toFixed(1)}%`
                                            : '--'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {onOpenPreview && (
                            <div className={styles.previewBanner}>
                                <span className={styles.previewBannerText}>
                                    Test conversational simulation live with Gemini AI
                                </span>
                                <button
                                    type="button"
                                    className={styles.previewBtn}
                                    onClick={() => onOpenPreview(scenario)}
                                >
                                    Live Preview
                                </button>
                            </div>
                        )}

                        <div>
                            <h3 className={styles.sectionTitle}>Description</h3>
                            <div className={styles.descriptionBox}>{scenario.description}</div>
                        </div>

                        <div className={styles.promptContextContainer}>
                            <div className={styles.promptHeader}>
                                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
                                    AI Prompt Context
                                </h3>
                                <button
                                    type="button"
                                    className={styles.copyBtn}
                                    onClick={handleCopyPrompt}
                                >
                                    {copied ? 'Copied!' : 'Copy Prompt'}
                                </button>
                            </div>
                            <pre className={styles.promptContextCode}>{scenario.promptContext}</pre>
                        </div>

                        <div>
                            <h3 className={styles.sectionTitle}>Metadata</h3>
                            <div className={styles.metaList}>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Scenario ID</span>
                                    <span>{scenario.id}</span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Custom Template</span>
                                    <span>{scenario.isCustom ? 'Yes' : 'No (Predefined System)'}</span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Created At</span>
                                    <span>{new Date(scenario.createdAt).toLocaleString()}</span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaLabel}>Last Updated</span>
                                    <span>{new Date(scenario.updatedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        {onEdit && (
                            <button
                                type="button"
                                className={styles.footerBtn}
                                onClick={() => {
                                    onClose();
                                    onEdit(scenario);
                                }}
                            >
                                Edit Scenario
                            </button>
                        )}
                        {onToggleStatus && (
                            <button
                                type="button"
                                className={`${styles.footerBtn} ${scenario.isActive ? styles.footerBtnDanger : styles.footerBtnPrimary}`}
                                onClick={() => onToggleStatus(scenario)}
                            >
                                {scenario.isActive ? 'Disable' : 'Enable'}
                            </button>
                        )}
                        {onViewInDepth && (
                            <button
                                type="button"
                                className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
                                onClick={() => {
                                    onClose();
                                    onViewInDepth(scenario.id);
                                }}
                            >
                                In-Depth View
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
