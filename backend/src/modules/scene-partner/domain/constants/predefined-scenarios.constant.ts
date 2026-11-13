import { ScenarioCategory } from "../enums/scene-partner.enums";
import { Scenario } from "../entities/scenario.entity";

export const PREDEFINED_SCENARIOS: readonly Scenario[] = [
    Scenario.createPredefined({
        id: "scenario-first-message",
        title: "Sending the First Message",
        description: "Practice breaking the ice, referencing a profile detail naturally, and avoiding generic greetings.",
        category: ScenarioCategory.FIRST_MESSAGE,
        promptContext: "You just matched with someone whose profile highlights indie music, hiking, and rescue dogs. Practice opening the conversation.",
    }),
    Scenario.createPredefined({
        id: "scenario-asking-out",
        title: "Asking Out for a Date",
        description: "Transitioning smoothly from chat to an in-person or video date with clarity, confidence, and low pressure.",
        category: ScenarioCategory.ASKING_OUT,
        promptContext: "You have had great banter for two days and want to propose meeting up for coffee or a weekend walk.",
    }),
    Scenario.createPredefined({
        id: "scenario-relationship-goals",
        title: "Discussing Long-Term Intentions",
        description: "Communicating your relationship goals honestly and aligning on future expectations without awkwardness.",
        category: ScenarioCategory.RELATIONSHIP_GOALS,
        promptContext: "You are having an evening conversation about what you are each looking for in a relationship and aligning on expectations.",
    }),
    Scenario.createPredefined({
        id: "scenario-life-logistics",
        title: "Navigating Busy Schedules & Routine",
        description: "Handling practical life constraints, demanding careers, and personal routines with empathy and open communication.",
        category: ScenarioCategory.LIFE_LOGISTICS,
        promptContext: "Both of you work demanding jobs and live across town. Practice communicating availability and making plans thoughtfully.",
    }),
    Scenario.createPredefined({
        id: "scenario-adoption-family",
        title: "Exploring Family Planning & Adoption",
        description: "Thoughtfully discussing openness to alternative family building, parenting values, or adoption in a safe space.",
        category: ScenarioCategory.ADOPTION,
        promptContext: "Discussing personal feelings, openness, and readiness around family building, adoption, and parenting timelines.",
    }),
    Scenario.createPredefined({
        id: "scenario-immigration-relocation",
        title: "Discussing Relocation & Cultural Heritage",
        description: "Navigating conversations around international backgrounds, visas, relocation possibilities, or cultural traditions.",
        category: ScenarioCategory.IMMIGRATION,
        promptContext: "Sharing perspectives on living in different cities or countries, cultural heritage, and future relocation openness.",
    }),
] as const;
