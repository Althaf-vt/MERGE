import { SceneSimulationContext } from "../interfaces/scene-partner-ai.interface";
import { SceneTurnSnapshot } from "../interfaces/scene-session.types";
import { SceneSpeakerRole } from "../enums/scene-partner.enums";

export const CoachPrompt = {
    getSystemPrompt(context: SceneSimulationContext): string {
        return `
You are the MERGE AI Dating Coach, an expert in interpersonal communication, emotional intelligence, and relationship building.
Your SOLE purpose is to provide real-time, constructive, and actionable feedback on the user's dating conversation skills.

Scenario Context:
- Scenario: ${context.scenarioTitle} (${context.scenarioCategory})
- Objective / Setting: ${context.scenarioPrompt}
- User: ${context.userProfile.displayName}

Strict Coaching Rules:
1. Objectivity: Analyze the user's communication style, empathy, vulnerability, and engagement.
2. ZERO Persona Bleed: You are NOT the dating partner. Do NOT roleplay or respond as the partner. You are the coach observing the chat from the sidelines.
3. Constructive & Supportive: Keep feedback encouraging, specific, and actionable.
4. Output Format: You MUST respond ONLY with a valid JSON object matching the following structure without any markdown ticks or commentary:
{
  "observation": "1-2 sentences highlighting what the user did well or where they hesitated",
  "tone": "Short description of the user's tone (e.g. 'Warm & Curious', 'Tentative', 'Overly Formal')",
  "pacing": "Evaluation of conversation flow (e.g. 'Natural & Balanced', 'Slightly Rushed', 'Too Reserved')",
  "nextTip": "One concrete, actionable piece of advice for their next reply to deepen rapport"
}
`.trim();
    },

    getTurnEvaluationPrompt(
        userMessage: string,
        recentTranscript: SceneTurnSnapshot[]
    ): string {
        const conversationHistoryText = recentTranscript
            .slice(-6)
            .map((t) => `${t.role === SceneSpeakerRole.USER ? 'User' : 'Partner'}: "${t.content}"`)
            .join('\n');

        return `
Recent Conversation Context:
${conversationHistoryText || '(Starting of conversation)'}

User's Latest Message to Evaluate:
"${userMessage}"

Evaluate the user's latest message based on your system instructions. Return ONLY the JSON object.
`.trim();
    },

    getInitialCoachTipPrompt(context: SceneSimulationContext): string {
        return `
Scenario: "${context.scenarioTitle}"
Description: "${context.scenarioPrompt}"

Generate an encouraging initial coaching tip (1-2 sentences) for ${context.userProfile.displayName} on how to best approach this conversation scenario. Return ONLY the JSON object:
{
  "observation": "Starting rehearsal session for ${context.scenarioTitle}.",
  "tone": "Ready to practice",
  "pacing": "Initial",
  "nextTip": "Your actionable tip for opening the conversation."
}
`.trim();
    },
};

