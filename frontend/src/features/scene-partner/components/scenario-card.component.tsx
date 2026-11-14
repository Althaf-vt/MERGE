import React from 'react';
import type { ScenarioDto } from '../types/scene-partner.types';
import { SCENARIO_CATEGORY_LABELS } from '../constants/scene-partner.constants';
import styles from './scenario-card.module.css';

export interface ScenarioCardProps {
    scenario: ScenarioDto;
    onStartPractice: (scenario: ScenarioDto) => void;
    isStarting?: boolean;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
    scenario,
    onStartPractice,
    isStarting = false,
}) => {
    const categoryLabel = SCENARIO_CATEGORY_LABELS[scenario.category] || scenario.category;

    return (
        <article className={styles.card} aria-label={`Scenario: ${scenario.title}`}>
            <div>
                <div className={styles.badgeRow}>
                    <span className={styles.categoryBadge}>{categoryLabel}</span>
                    {scenario.isCustom && (
                        <span className={styles.customBadge}>Custom</span>
                    )}
                </div>

                <h3 className={styles.title}>{scenario.title}</h3>
                <p className={styles.description}>{scenario.description}</p>

                {scenario.promptContext && (
                    <div className={styles.contextPreview}>
                        <span className={styles.contextLabel}>Context Preview</span>
                        <div className={styles.contextText}>{scenario.promptContext}</div>
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.startButton}
                    onClick={() => onStartPractice(scenario)}
                    disabled={isStarting}
                >
                    {isStarting ? (
                        <>
                            <span className={styles.spinner} aria-hidden="true" />
                            <span>Starting...</span>
                        </>
                    ) : (
                        <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            <span>Start Practice</span>
                        </>
                    )}
                </button>
            </div>
        </article>
    );
};

