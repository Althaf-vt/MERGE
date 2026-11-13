import { SceneSimulationContext } from "../interfaces/scene-partner-ai.interface";
import { SceneTurnSnapshot } from "../interfaces/scene-session.types";
import { SceneSpeakerRole } from "../enums/scene-partner.enums";

export const SessionSummaryPrompt = {
  getPrompt(context: SceneSimulationContext, transcript: SceneTurnSnapshot[]): string {
    const transcriptText = transcript
      .map((t, index) => `${index + 1}. [${t.role === SceneSpeakerRole.USER ? 'User' : 'Simulated Partner'}]: ${t.content}`)
      .join('\n');

    return `
You are the MERGE AI Dating Coach. You are conducting the post-session debrief for a completed conversation rehearsal.

Rehearsal Scenario:
- Title: ${context.scenarioTitle} (${context.scenarioCategory})
- Setting & Goal: ${context.scenarioPrompt}
- User: ${context.userProfile.displayName}

Full Conversation Transcript:
${transcriptText}

Task:
Analyze the user's communication style, responsiveness, empathy, and conversational confidence.
Provide an encouraging, thorough, and structured post-session evaluation.

You MUST respond ONLY with a valid JSON object matching the following structure without any markdown ticks:
{
  "summary": "A 2-3 sentence overall summary of how the rehearsal went and the dynamic achieved.",
  "thingsToNote": [
    "Specific observation about a strong moment or conversational tactic",
    "Specific observation about a moment where the user could improve or seemed hesitant"
  ],
  "takeaways": [
    "Practical takeaway 1 to apply when talking to real matches",
    "Practical takeaway 2 on managing conversation flow and emotional connection"
  ],
  "coachingNotes": "A comprehensive paragraph synthesizing the coach's overall impressions and guidance for future dates.",
  "communicationScore": 85
}
`.trim();
  },
};

