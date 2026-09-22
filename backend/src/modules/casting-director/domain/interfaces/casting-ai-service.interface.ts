import { CastingUserContextDto } from "../../../users/application/dtos/casting-user-context.dto";
import { TranscriptEntry } from "../entities/casting-session.entity";

export const CASTING_AI_SERVICE = 'CASTING_AI_SERVICE';

export interface ICastingAiService {
    generateOpeningQuestion(context: any): Promise<string>;
    generateFollowUpQuestion(context: CastingUserContextDto, transcript: TranscriptEntry[]): Promise<string>;
    extractSummaryAndVector(context: CastingUserContextDto, transcript: TranscriptEntry[]): Promise<{ aiSummary: string; personalityVector: number[] }>;
}