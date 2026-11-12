import { ScenarioCategory, SceneSpeakerRole, SimulationType } from "../enums/scene-partner.enums";
import { CoachNoteProps } from "../value-objects/coach-note.vo";

export interface SceneTurnItem {
    role: SceneSpeakerRole;
    content: string;
    coachNote?: CoachNoteProps | null;
    timestamp: Date;
}

export interface SceneSimulationContext {
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    scenarioPrompt: string;
    simulationType: SimulationType;
    userProfile: {
        displayName: string;
        relationshipGoals?: string;
        selectedTraits?: string[];
    };
    partnerProfile?: {
        displayName: string;
        bio?: string;
        selectedTraits?: string[];
        relationshipGoals?: string;
        personalitySummary?: string;
    };
}

export interface GenerateInitialGreetingResult {
    openingMessage: string;
    coachNote?: CoachNoteProps;
}

export interface GenerateTurnResult {
    personaReply: string;
    coachNote: CoachNoteProps;
}

export interface SceneSessionSummaryData {
    summary: string;
    thingsToNote: string[];
    takeaways: string[];
    coachingNotes: string;
    communicationScore?: number;
}

export const SCENE_PARTNER_AI_SERVICE = 'SCENE_PARTNER_AI_SERVICE';

export interface IScenePartnerAiService {
    generateInitialGreeting(context: SceneSimulationContext): Promise<GenerateInitialGreetingResult>;
    generateTurn(context: SceneSimulationContext, userMessage: string, history: SceneTurnItem[]): Promise<GenerateTurnResult>;
    generateSessionSummary(context: SceneSimulationContext, history: SceneTurnItem[]): Promise<SceneSessionSummaryData>;
}
