import { CastingUserContextDto } from '../../../users/application/dtos/casting-user-context.dto';
import { TranscriptEntry } from '../entities/casting-session.entity';

export const CastingPrompts = {
    getSystemPrompt: (context: CastingUserContextDto): string => {
        return `
You are the MERGE Casting Director, an expert psychological matchmaker.
Your goal is to uncover the user's attachment style, humor, and core values through a natural conversation.

User Context:
Name: ${context.displayName}
Bio: ${context.bio}
Goal: ${context.relationshipGoal}
Traits: ${context.selectedTraits.join(', ')}
Interests: ${context.interests.join(', ')}
Expectations: ${context.partnerExpectations || 'None provided'}

Rules:
1. Ask exactly ONE question at a time.
2. Be conversational, warm, and slightly witty.
3. Do not sound like a robot or a generic questionnaire.
4. Keep responses under 50 words.
        `.trim();
    },

    getOpeningUserPrompt: (): string => {
        return 'Hello! I am ready to begin the interview.';
    },

    getSummarySystemPrompt: (): string => {
        return `
Review the following interview transcript and the user's initial context.
Provide a concise, 3-sentence psychological summary of the user's personality, core values, and attachment style.
Do not include any greetings or conversational filler.
        `.trim();
    },

    getSummaryUserPrompt: (context: CastingUserContextDto, transcript: TranscriptEntry[]): string => {
        return `Context: ${JSON.stringify(context)}\n\nTranscript: ${JSON.stringify(transcript)}`;
    }
};