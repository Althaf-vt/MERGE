import type { ScenarioCategory } from "../types/scene-partner.types";

export const SCENARIO_CATEGORY_LABELS: Record<ScenarioCategory, string> = {
    FIRST_MESSAGE: "First Message",
    ASKING_OUT: "Asking Out",
    RELATIONSHIP_GOALS: "Relationship Goals",
    LIFE_LOGISTICS: "Life Logistics",
    ADOPTION: "Adoption & Family",
    IMMIGRATION: "Immigration & Relocation",
    CUSTOM: "Custom Scenario",
};

export const SCENARIO_CATEGORY_TABS: Array<{ key: ScenarioCategory | "ALL"; label: string }> = [
    { key: "ALL", label: "All Scenarios" },
    { key: "FIRST_MESSAGE", label: "First Message" },
    { key: "ASKING_OUT", label: "Asking Out" },
    { key: "RELATIONSHIP_GOALS", label: "Relationship Goals" },
    { key: "LIFE_LOGISTICS", label: "Life Logistics" },
    { key: "ADOPTION", label: "Adoption" },
    { key: "IMMIGRATION", label: "Immigration" },
];

export const SCENE_PARTNER_CONFIG = {
    MAX_MESSAGE_LENGTH: 1000,
    DEFAULT_HISTORY_LIMIT: 10,
    TIMER_TICK_MS: 1000,
} as const;

