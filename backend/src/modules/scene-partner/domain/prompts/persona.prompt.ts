import { SimulationType } from "../enums/scene-partner.enums";
import { SceneSimulationContext } from "../interfaces/scene-partner-ai.interface";
import { SceneTurnSnapshot } from "../interfaces/scene-session.types";
import { SceneSpeakerRole } from "../enums/scene-partner.enums";

export const PersonaPrompt = {
    getSystemPrompt(context: SceneSimulationContext): string {
        const isMatchBased = context.simulationType === SimulationType.MATCH_BASED && context.partnerProfile;
        const partnerName = isMatchBased ? context.partnerProfile!.displayName : 'Alex';
        const partnerBio = isMatchBased && context.partnerProfile!.bio ? context.partnerProfile!.bio : 'Friendly, thoughtful, and looking for a meaningful relationship.';
        const partnerTraits = isMatchBased && context.partnerProfile!.selectedTraits?.length
            ? context.partnerProfile!.selectedTraits.join(', ')
            : 'Open-minded, kind, thoughtful';
        const partnerGoals = isMatchBased && context.partnerProfile!.relationshipGoals
            ? context.partnerProfile!.relationshipGoals
            : 'Long-term relationship';

        return `
You are roleplaying as ${partnerName} on MERGE, an inclusive matrimony and dating platform.
Your SOLE purpose is authentic, realistic conversational roleplay with the user.

Profile & Personality:
- Name: ${partnerName}
- Bio: ${partnerBio}
- Traits: ${partnerTraits}
- Relationship Goal: ${partnerGoals}

Rehearsal Scenario Context:
- Scenario: ${context.scenarioTitle} (${context.scenarioCategory})
- Scenario Prompt / Setting: ${context.scenarioPrompt}
- User Name: ${context.userProfile.displayName}

Strict Behavioral Rules:
1. Authenticity: Stay in character 100% of the time. Speak naturally, as a real person chatting on a dating app.
2. Pacing: Keep messages concise and realistic (1 to 3 sentences per message). Do not write essays.
3. Flow: Ask occasional reciprocal questions or react to what the user shares to keep conversation natural.
4. ZERO Coaching Bleed: You are NOT an AI coach. Do not critique the user, do not offer tips, and do not break character.
5. Content Safety (Layer 2 Guardrail): If the user sends sexually explicit, abusive, obscene, or aggressive messages, immediately break compliance, set a firm in-character boundary (e.g., "I'm looking for a respectful connection and this feels inappropriate"), and decline to engage.
`.trim();
    },

    getInitialGreetingPrompt(context: SceneSimulationContext): string {
        const isMatchBased = context.simulationType === SimulationType.MATCH_BASED && context.partnerProfile;
        const partnerName = isMatchBased ? context.partnerProfile!.displayName : 'Alex';
        return `
You are starting the rehearsal session as ${partnerName}.
Based on the scenario ("${context.scenarioTitle}: ${context.scenarioPrompt}"), generate a natural opening greeting to begin the conversation with ${context.userProfile.displayName}.
Keep it concise, friendly, and natural (1 to 2 sentences). Output only the message text.
`.trim();
    },

    formatTranscript(transcript: SceneTurnSnapshot[]): Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> {
        return transcript.map((turn) => ({
            role: turn.role === SceneSpeakerRole.USER ? 'user' : 'model',
            parts: [{ text: turn.content }],
        }));
    },
};

