import React, { useEffect, useState } from 'react';
import type { AdminScenarioDto, ScenarioCategory } from '../../types/admin-scene-partner.types';
import {
    SCENARIO_CATEGORY_OPTIONS,
    SCENARIO_FORM_LIMITS,
} from '../../constants/admin-scene-partner.constants';
import { useCreateScenarioMutation, useUpdateScenarioMutation } from '../../api/admin-scene-partner.api';
import { AdminModal } from '../../../../../shared/admin/components/admin-modal.component';
import { getErrorMessage } from '../../../../../shared/utils/error.util';
import styles from './scenario-form-modal.module.css';

export interface ScenarioFormModalProps {
    isOpen: boolean;
    scenario?: AdminScenarioDto | null;
    onClose: () => void;
    onSuccess?: (savedScenario: AdminScenarioDto) => void;
    onOpenPreview?: (draft: {
        scenarioId?: string;
        title: string;
        category: ScenarioCategory;
        promptContext: string;
    }) => void;
}

export const ScenarioFormModal: React.FC<ScenarioFormModalProps> = ({
    isOpen,
    scenario,
    onClose,
    onSuccess,
    onOpenPreview,
}) => {
    const isEdit = Boolean(scenario?.id);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<ScenarioCategory>('FIRST_MESSAGE');
    const [description, setDescription] = useState('');
    const [promptContext, setPromptContext] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);

    const [createScenario, { isLoading: isCreating }] = useCreateScenarioMutation();
    const [updateScenario, { isLoading: isUpdating }] = useUpdateScenarioMutation();

    const isSubmitting = isCreating || isUpdating;

    useEffect(() => {
        if (!isOpen) {
            setErrors({});
            setServerError(null);
            return;
        }

        if (scenario) {
            setTitle(scenario.title);
            setCategory(scenario.category);
            setDescription(scenario.description);
            setPromptContext(scenario.promptContext);
        } else {
            setTitle('');
            setCategory('FIRST_MESSAGE');
            setDescription('');
            setPromptContext('');
        }
        setErrors({});
        setServerError(null);
    }, [isOpen, scenario]);

    if (!isOpen) return null;

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            nextErrors.title = 'Title is required.';
        } else if (trimmedTitle.length < SCENARIO_FORM_LIMITS.TITLE_MIN) {
            nextErrors.title = `Title must be at least ${SCENARIO_FORM_LIMITS.TITLE_MIN} characters.`;
        } else if (trimmedTitle.length > SCENARIO_FORM_LIMITS.TITLE_MAX) {
            nextErrors.title = `Title cannot exceed ${SCENARIO_FORM_LIMITS.TITLE_MAX} characters.`;
        }

        const trimmedDesc = description.trim();
        if (!trimmedDesc) {
            nextErrors.description = 'Description is required.';
        } else if (trimmedDesc.length < SCENARIO_FORM_LIMITS.DESCRIPTION_MIN) {
            nextErrors.description = `Description must be at least ${SCENARIO_FORM_LIMITS.DESCRIPTION_MIN} characters.`;
        } else if (trimmedDesc.length > SCENARIO_FORM_LIMITS.DESCRIPTION_MAX) {
            nextErrors.description = `Description cannot exceed ${SCENARIO_FORM_LIMITS.DESCRIPTION_MAX} characters.`;
        }

        const trimmedPrompt = promptContext.trim();
        if (!trimmedPrompt) {
            nextErrors.promptContext = 'AI Prompt Context is required.';
        } else if (trimmedPrompt.length < SCENARIO_FORM_LIMITS.PROMPT_CONTEXT_MIN) {
            nextErrors.promptContext = `Prompt context must be at least ${SCENARIO_FORM_LIMITS.PROMPT_CONTEXT_MIN} characters.`;
        } else if (trimmedPrompt.length > SCENARIO_FORM_LIMITS.PROMPT_CONTEXT_MAX) {
            nextErrors.promptContext = `Prompt context cannot exceed ${SCENARIO_FORM_LIMITS.PROMPT_CONTEXT_MAX} characters.`;
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) return;

        try {
            if (isEdit && scenario) {
                const response = await updateScenario({
                    id: scenario.id,
                    body: {
                        title: title.trim(),
                        category,
                        description: description.trim(),
                        promptContext: promptContext.trim(),
                    },
                }).unwrap();

                if (response.data && onSuccess) {
                    onSuccess(response.data);
                }
            } else {
                const response = await createScenario({
                    title: title.trim(),
                    category,
                    description: description.trim(),
                    promptContext: promptContext.trim(),
                }).unwrap();

                if (response.data && onSuccess) {
                    onSuccess(response.data);
                }
            }
            onClose();
        } catch (err: unknown) {
            setServerError(getErrorMessage(err, 'Failed to save scenario. Please check invariants.'));
        }
    };

    const handlePreviewClick = () => {
        if (!onOpenPreview) return;
        onOpenPreview({
            scenarioId: scenario?.id,
            title: title.trim() || 'Untitled Preview Scenario',
            category,
            promptContext: promptContext.trim(),
        });
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'EDIT SCENARIO' : 'CREATE SCENARIO'}
            subtitle={
                isEdit && scenario
                    ? `ID: ${scenario.id} • UPDATED: ${new Date(scenario.updatedAt).toLocaleDateString()}`
                    : 'DEFINE A NEW CONVERSATION REHEARSAL SCENARIO'
            }
            maxWidth="640px"
        >
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
                {serverError && <div className={styles.errorBanner}>{serverError}</div>}

                <div className={styles.fieldGroup}>
                    <div className={styles.labelRow}>
                        <label className={styles.label} htmlFor="scenario-title">
                            Scenario Title <span className={styles.required}>*</span>
                        </label>
                        <span className={styles.counter}>
                            {title.length} / {SCENARIO_FORM_LIMITS.TITLE_MAX}
                        </span>
                    </div>
                    <input
                        id="scenario-title"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Handling Emotional Conflict in Cohabitation"
                        value={title}
                        maxLength={SCENARIO_FORM_LIMITS.TITLE_MAX}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSubmitting}
                    />
                    {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="scenario-category">
                        Category <span className={styles.required}>*</span>
                    </label>
                    <select
                        id="scenario-category"
                        className={styles.select}
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ScenarioCategory)}
                        disabled={isSubmitting}
                    >
                        {SCENARIO_CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <div className={styles.labelRow}>
                        <label className={styles.label} htmlFor="scenario-description">
                            Description <span className={styles.required}>*</span>
                        </label>
                        <span className={styles.counter}>
                            {description.length} / {SCENARIO_FORM_LIMITS.DESCRIPTION_MAX}
                        </span>
                    </div>
                    <textarea
                        id="scenario-description"
                        className={`${styles.textarea}`}
                        placeholder="Briefly describe the context, objectives, and user mindset for this rehearsal scenario..."
                        value={description}
                        maxLength={SCENARIO_FORM_LIMITS.DESCRIPTION_MAX}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                    />
                    {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <div className={styles.labelRow}>
                        <label className={styles.label} htmlFor="scenario-prompt-context">
                            AI Prompt Context (Persona & Guidelines) <span className={styles.required}>*</span>
                        </label>
                        <span className={styles.counter}>
                            {promptContext.length} / {SCENARIO_FORM_LIMITS.PROMPT_CONTEXT_MAX}
                        </span>
                    </div>
                    <textarea
                        id="scenario-prompt-context"
                        className={`${styles.textarea} ${styles.promptTextarea}`}
                        placeholder="Specify roleplay instructions for Gemini AI: persona attributes, conversational tone, boundaries, and simulation dynamics..."
                        value={promptContext}
                        maxLength={SCENARIO_FORM_LIMITS.PROMPT_CONTEXT_MAX}
                        onChange={(e) => setPromptContext(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <span className={styles.helpText}>
                        This system instruction dictates the AI partner's personality, pacing, and scenario context during user simulations.
                    </span>
                    {errors.promptContext && <span className={styles.fieldError}>{errors.promptContext}</span>}
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>

                    {onOpenPreview && promptContext.trim().length >= SCENARIO_FORM_LIMITS.PROMPT_CONTEXT_MIN && (
                        <button
                            type="button"
                            className={styles.previewBtn}
                            onClick={handlePreviewClick}
                            disabled={isSubmitting}
                        >
                            Test in Live Preview
                        </button>
                    )}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'SAVING...'
                            : isEdit
                              ? 'UPDATE SCENARIO'
                              : 'CREATE SCENARIO'}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
};
