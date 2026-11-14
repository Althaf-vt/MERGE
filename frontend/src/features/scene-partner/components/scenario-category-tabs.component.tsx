import React from 'react';
import type { ScenarioCategory } from '../types/scene-partner.types';
import { SCENARIO_CATEGORY_TABS } from '../constants/scene-partner.constants';
import styles from './scenario-category-tabs.module.css';

export interface ScenarioCategoryTabsProps {
    activeCategory: ScenarioCategory | 'ALL';
    onSelectCategory: (category: ScenarioCategory | 'ALL') => void;
}

export const ScenarioCategoryTabs: React.FC<ScenarioCategoryTabsProps> = ({
    activeCategory,
    onSelectCategory,
}) => {
    return (
        <div className={styles.tabsContainer} role="tablist" aria-label="Scenario categories">
            {SCENARIO_CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.key;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
                        onClick={() => onSelectCategory(tab.key)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

