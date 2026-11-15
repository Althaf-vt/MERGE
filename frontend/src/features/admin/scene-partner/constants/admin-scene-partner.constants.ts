// UI Taxonomies, Select Options, and Form Constants for Scene Partner Admin.

import type {
    ScenarioCategory,
    SceneSessionStatus,
    SimulationType,
    ScenarioTimeframe,
    ScenarioExportFormat,
} from '../types/admin-scene-partner.types';

// Scenario category human-readable labels.
export const SCENARIO_CATEGORY_LABELS: Record<ScenarioCategory, string> = {
    FIRST_MESSAGE: 'First Message',
    ASKING_OUT: 'Asking Out',
    RELATIONSHIP_GOALS: 'Relationship Goals',
    LIFE_LOGISTICS: 'Life Logistics',
    ADOPTION: 'Adoption',
    IMMIGRATION: 'Immigration',
    CUSTOM: 'Custom Scenario',
};

// Scenario category select options for forms.
export const SCENARIO_CATEGORY_OPTIONS: { value: ScenarioCategory; label: string }[] = [
    { value: 'FIRST_MESSAGE', label: 'First Message' },
    { value: 'ASKING_OUT', label: 'Asking Out' },
    { value: 'RELATIONSHIP_GOALS', label: 'Relationship Goals' },
    { value: 'LIFE_LOGISTICS', label: 'Life Logistics' },
    { value: 'ADOPTION', label: 'Adoption' },
    { value: 'IMMIGRATION', label: 'Immigration' },
    { value: 'CUSTOM', label: 'Custom Scenario' },
];

// Scenario category filter options including all categories wildcard.
export const SCENARIO_CATEGORY_FILTER_OPTIONS: { value: ScenarioCategory | ''; label: string }[] = [
    { value: '', label: 'ALL CATEGORIES' },
    ...SCENARIO_CATEGORY_OPTIONS,
];

// Scenario status filter dropdown options.
export const SCENARIO_STATUS_FILTER_OPTIONS: { value: '' | 'true' | 'false'; label: string }[] = [
    { value: '', label: 'ALL STATUSES' },
    { value: 'true', label: 'ACTIVE' },
    { value: 'false', label: 'INACTIVE' },
];

// Session status labels map.
export const SCENE_SESSION_STATUS_LABELS: Record<SceneSessionStatus, string> = {
    INITIALIZING: 'Initializing',
    IN_PROGRESS: 'In Progress',
    PAUSED: 'Paused',
    COMPLETED: 'Completed',
};

// Session status filter options.
export const SESSION_STATUS_FILTER_OPTIONS: { value: SceneSessionStatus | ''; label: string }[] = [
    { value: '', label: 'ALL STATUSES' },
    { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
    { value: 'COMPLETED', label: 'COMPLETED' },
    { value: 'PAUSED', label: 'PAUSED' },
    { value: 'INITIALIZING', label: 'INITIALIZING' },
];

// Simulation type filter options.
export const SIMULATION_TYPE_FILTER_OPTIONS: { value: SimulationType | ''; label: string }[] = [
    { value: '', label: 'ALL TYPES' },
    { value: 'GENERIC', label: 'GENERIC' },
    { value: 'MATCH_BASED', label: 'MATCH BASED' },
];

// Scenario timeframe switcher options for in-depth analytics.
export const SCENARIO_TIMEFRAME_OPTIONS: { value: ScenarioTimeframe; label: string }[] = [
    { value: '7D', label: '7D' },
    { value: '30D', label: '30D' },
    { value: '90D', label: '90D' },
];

// Export format options.
export const SCENARIO_EXPORT_FORMAT_OPTIONS: { value: ScenarioExportFormat; label: string }[] = [
    { value: 'csv', label: 'CSV Format' },
    { value: 'json', label: 'JSON Format' },
];

// Default pagination parameters.
export const DEFAULT_PAGE_LIMIT = 15;
export const DEFAULT_PAGE = 1;

// Form input length limits matching backend validation invariants.
export const SCENARIO_FORM_LIMITS = {
    TITLE_MIN: 3,
    TITLE_MAX: 100,
    DESCRIPTION_MIN: 5,
    DESCRIPTION_MAX: 500,
    PROMPT_CONTEXT_MIN: 10,
    PROMPT_CONTEXT_MAX: 1000,
} as const;

// Default initial state for scenario creation form.
export const DEFAULT_SCENARIO_FORM_VALUES = {
    title: '',
    description: '',
    category: 'FIRST_MESSAGE' as ScenarioCategory,
    promptContext: '',
};
