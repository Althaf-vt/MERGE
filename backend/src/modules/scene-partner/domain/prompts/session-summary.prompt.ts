import { SceneSimulationContext } from "../interfaces/scene-partner-ai.interface";
import { SceneTurnSnapshot } from "../interfaces/scene-session.types";
import { SceneSpeakerRole, SimulationType } from "../enums/scene-partner.enums";

export const SessionSummaryPrompt = {
  getPrompt(context: SceneSimulationContext, transcript: SceneTurnSnapshot[]): string {
    const partnerName =
      context.simulationType === SimulationType.MATCH_BASED && context.partnerProfile?.displayName
        ? context.partnerProfile.displayName
        : 'Alex';
    const userName = context.userProfile?.displayName || 'User';

    const transcriptText = transcript
      .map((t, index) => {
        const speaker =
          t.role === SceneSpeakerRole.USER ? `USER [${userName}]` : `SIMULATED PARTNER [${partnerName}]`;
        return `${index + 1}. ${speaker}: "${t.content}"`;
      })
      .join('\n');

    return `
You are the MERGE AI Dating Coach evaluating USER [${userName}]'s real-time communication performance.

Session Information:
- Scenario: ${context.scenarioTitle} (${context.scenarioCategory})
- Goal / Setting: ${context.scenarioPrompt}
- User: ${userName}
- Simulated Partner: ${partnerName}

Transcript:
${transcriptText}

CRITICAL COACHING PRINCIPLES:
1. OBJECTIVITY OVER FLATTERY: You are a candid, professional coach, NOT a people-pleaser. NEVER invent fake strengths or praise low-effort answers. Flattering a user for dry, lazy, or one-word messages ruins their real-world dating chances.
2. ACCURATE ATTRIBUTION: Only evaluate messages sent by USER [${userName}]. Do NOT attribute the witty, proactive, or thoughtful questions of SIMULATED PARTNER [${partnerName}] to ${userName}.
3. STRICT SCORING RUBRIC (0 to 100):
   - 0 to 45 (Disengaged / Low Effort): User gave very short, passive, or monosyllabic replies (e.g. "sounds good", "hi there", "sure", "thanks"). Failed to answer open questions, asked zero questions, forced the partner to do 100% of the conversational work.
   - 46 to 65 (Below Average / Hesitant): Answered questions minimally with little detail. Polite but dry, no follow-up questions, feels like an interview.
   - 66 to 79 (Average / Acceptable): Shared basic preferences and answered questions, but lacked proactive curiosity, playful energy, or missed chances to deepen connection.
   - 80 to 89 (Strong / Engaging): Active listener, asked thoughtful questions back, showed genuine warmth and personality.
   - 90 to 100 (Exceptional): Outstanding chemistry, charming banter, emotionally engaging, natural flow and pacing.

Output Format:
You MUST respond ONLY with a raw JSON object conforming exactly to this structure without markdown code blocks:
{
  "summary": "2-3 sentences summarizing ${userName}'s actual effort, engagement level, and conversational dynamic.",
  "takeaways": [
    "Key Strength 1 actually demonstrated by ${userName} (if ${userName} put in almost no effort, honestly state that engagement was too minimal to demonstrate strong conversational habits)",
    "Key Strength 2 actually demonstrated by ${userName}"
  ],
  "thingsToNote": [
    "Primary Area for Improvement (specifically highlight passive replies, lack of questions, or stalled momentum)",
    "Secondary Area for Improvement (actionable behavioral correction)"
  ],
  "coachingNotes": "A direct, candid paragraph explaining why ${userName} received this score and what specific changes they should make on their next real date.",
  "communicationScore": 0
}
Note on "communicationScore": Replace 0 with an integer from 0 to 100 strictly determined by where ${userName}'s performance falls on the rubric above. For minimal effort or 1-2 word replies, score MUST be below 45.
`.trim();
  },
};
