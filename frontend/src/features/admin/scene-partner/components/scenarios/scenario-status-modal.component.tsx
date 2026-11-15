import React, { useState } from 'react';
import type { AdminScenarioDto } from '../../types/admin-scene-partner.types';
import { SCENARIO_CATEGORY_LABELS } from '../../constants/admin-scene-partner.constants';
import { useToggleScenarioStatusMutation } from '../../api/admin-scene-partner.api';
import { AdminModal } from '../../../../../shared/admin/components/admin-modal.component';
import { getErrorMessage } from '../../../../../shared/utils/error.util';
import styles from './scenario-status-modal.module.css';

export interface ScenarioStatusModalProps {
    isOpen: boolean;
    scenario: AdminScenarioDto | null;
    onClose: () => void;
    onSuccess?: (updatedScenario: AdminScenarioDto) => void;
}

export const ScenarioStatusModal: React.FC<ScenarioStatusModalProps> = ({
    isOpen,
    scenario,
    onClose,
    onSuccess,
}) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [toggleScenarioStatus, { isLoading }] = useToggleScenarioStatusMutation();

    if (!isOpen || !scenario) return null;

    const willActivate = !scenario.isActive;

    const handleConfirm = async () => {
        setServerError(null);
        try {
            const response = await toggleScenarioStatus({
                id: scenario.id,
                body: { isActive: willActivate },
            }).unwrap();

            if (response.data && onSuccess) {
                onSuccess(response.data);
            }
            onClose();
        } catch (err: unknown) {
            setServerError(getErrorMessage(err, 'Failed to update scenario status.'));
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={willActivate ? 'ENABLE SCENARIO' : 'DISABLE SCENARIO'}
            subtitle={`ID: ${scenario.id}`}
            size="md"
        >
            <div className={styles.content}>
                {serverError && <div className={styles.errorBanner}>{serverError}</div>}

                <div className={styles.scenarioSummaryCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.scenarioTitle}>{scenario.title}</span>
                        <span className={styles.categoryBadge}>
                            {SCENARIO_CATEGORY_LABELS[scenario.category] || scenario.category}
                        </span>
                    </div>
                    <div className={styles.metaRow}>
                        <span>Sessions: {scenario.summary?.totalSessions?.toLocaleString() ?? 0}</span>
                        <span>
                            Completion:{' '}
                            {scenario.summary?.completionRate !== undefined
                                ? `${scenario.summary.completionRate.toFixed(1)}%`
                                : '--'}
                        </span>
                    </div>
                </div>

                <div className={`${styles.noticeBox} ${willActivate ? styles.noticeSuccess : styles.noticeWarning}`}>
                    <div className={styles.noticeIcon}>
                        {willActivate ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        )}
                    </div>
                    <div className={styles.noticeText}>
                        {willActivate ? (
                            <span>
                                Enabling this scenario will <strong className={styles.noticeHighlight}>immediately restore its visibility</strong> in the user discovery catalog. Users will be able to start new practice simulations with it.
                            </span>
                        ) : (
                            <span>
                                Disabling this scenario will <strong className={styles.noticeHighlight}>immediately remove it from user discovery</strong> and prevent new rehearsal sessions from starting. Existing user session history, coach notes, and analytics <strong className={styles.noticeHighlight}>will not be deleted</strong>.
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={willActivate ? styles.actionBtnPrimary : styles.actionBtnDanger}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? 'UPDATING...'
                            : willActivate
                              ? 'CONFIRM & ENABLE'
                              : 'CONFIRM & DISABLE'}
                    </button>
                </div>
            </div>
        </AdminModal>
    );
};
