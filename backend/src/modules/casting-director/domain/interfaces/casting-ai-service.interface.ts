import { ICastingUserContext } from "./casting-user-context.interface";
import { TranscriptEntry } from "../entities/casting-session.entity";

export const CASTING_AI_SERVICE = 'CASTING_AI_SERVICE';

export interface ICastingAiService {
    generateOpeningQuestion(context: ICastingUserContext): Promise<string>;
    generateFollowUpQuestion(context: ICastingUserContext, transcript: TranscriptEntry[]): Promise<string>;
    extractSummaryAndVector(context: ICastingUserContext, transcript: TranscriptEntry[]): Promise<{ aiSummary: string; personalityVector: number[] }>;
}