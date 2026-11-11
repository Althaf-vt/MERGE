import React, { useState, useEffect } from 'react';
import styles from './kyc-resubmission-modal.module.css';
import type { KycResubmissionReason } from '../types/kyc-escalation.types';
import { KYC_RESUBMISSION_OPTIONS } from '../constants/kyc-escalation.constants';
import { useRequestResubmissionKycTaskMutation } from '../api/kyc-escalation.api';
import { getErrorMessage } from '../../../../shared/utils/error.util';
import { AdminModal } from '../../../../shared/admin/components/admin-modal.component';

interface KycResubmissionModalProps {
    isOpen: boolean;
    taskId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export const KycResubmissionModal: React.FC<KycResubmissionModalProps> = ({
    isOpen,
    taskId,
    onClose,
    onSuccess,
}) => {
    const [selectedReasons, setSelectedReasons] = useState<KycResubmissionReason[]>([]);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [requestResubmission, { isLoading }] = useRequestResubmissionKycTaskMutation();

    useEffect(() => {
        if (isOpen) {
            setSelectedReasons([]);
            setMessage('');
            setErrorMsg('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleReason = (reason: KycResubmissionReason) => {
        if (isLoading) return;
        setErrorMsg('');
        setSelectedReasons((prev) =>
            prev.includes(reason)
                ? prev.filter((r) => r !== reason)
                : [...prev, reason]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedReasons.length === 0) {
            setErrorMsg('PLEASE SELECT AT LEAST ONE RESUBMISSION REASON.');
            return;
        }

        setErrorMsg('');
        try {
            await requestResubmission({
                id: taskId,
                reasons: selectedReasons,
                message: message.trim() || undefined,
            }).unwrap();

            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, 'Failed to request KYC resubmission.'));
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={isLoading ? () => {} : onClose}
            title="REQUEST KYC RESUBMISSION"
            subtitle="Select the items requiring user re-submission"
            size="md"
        >
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.body}>
                    <div className={styles.section}>
                        <label className={styles.sectionLabel}>
                            RESUBMISSION REASONS <span className={styles.requiredIndicator}>*</span>
                        </label>
                        <div className={styles.optionsList}>
                            {KYC_RESUBMISSION_OPTIONS.map((opt) => {
                                const isSelected = selectedReasons.includes(opt.value);
                                return (
                                    <div
                                        key={opt.value}
                                        className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
                                        onClick={() => toggleReason(opt.value)}
                                        role="checkbox"
                                        aria-checked={isSelected}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === ' ' || e.key === 'Enter') {
                                                e.preventDefault();
                                                toggleReason(opt.value);
                                            }
                                        }}
                                    >
                                        <div className={`${styles.customCheckbox} ${isSelected ? styles.checkboxChecked : ''}`}>
                                            {isSelected && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path
                                                        d="M1 4L3.5 6.5L9 1"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={styles.optionLabel}>{opt.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <label className={styles.sectionLabel} htmlFor="resubmission-message">
                            INSTRUCTIONS / NOTES FOR USER <span className={styles.optionalHint}>(OPTIONAL)</span>
                        </label>
                        <textarea
                            id="resubmission-message"
                            className={styles.textarea}
                            placeholder="e.g. Ensure all 4 corners of ID are visible and lighting is clear..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isLoading}
                            maxLength={500}
                        />
                        <div className={styles.charCount}>
                            {message.length} / 500
                        </div>
                    </div>

                    {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
                </div>

                <footer className={styles.footer}>
                    <button
                        type="button"
                        className={styles.btnCancel}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        CANCEL
                    </button>
                    <button
                        type="submit"
                        className={styles.btnSubmit}
                        disabled={isLoading || selectedReasons.length === 0}
                    >
                        {isLoading ? 'SENDING REQUEST...' : 'CONFIRM RESUBMISSION'}
                    </button>
                </footer>
            </form>
        </AdminModal>
    );
};

