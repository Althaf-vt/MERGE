import { Logger } from "@nestjs/common";
import { ICastingAiService } from "../../domain/interfaces/casting-ai-service.interface";
import OpenAI from 'openai'
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { CastingUserContextDto } from "../../../users/application/dtos/casting-user-context.dto";
import { TranscriptEntry } from "../../domain/entities/casting-session.entity";
export class OpenRouterCastingAiService implements ICastingAiService {
    private readonly _client: OpenAI;
    private readonly _logger = new Logger(OpenRouterCastingAiService.name);

    // We use the free router for chat to bypass traffic/billing limits during dev
    private readonly _chatModel = 'openrouter/free';

    // we use an OpenRouter supported embedding model for the RAG vecor
    private readonly _embdedingModel = 'openai/text-embedding-3-small';

    constructor() {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey || apiKey.trim().length === 0) {
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, "OPENROUTER_API_KEY is missing.");
        }

        const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const appTitle = process.env.APP_NAME || 'MERGE';

        this._client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey,
            defaultHeaders: {
                'HTTP-Referer': appUrl,
                'X-Title': appTitle,
            },
        });
    }

    private _buildSystemPrompt(context: CastingUserContextDto): string {
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
    }

    async generateOpeningQuestion(context: any): Promise<string> {
        try {
            const completion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages: [
                    { role: 'system', content: this._buildSystemPrompt(context) },
                    { role: 'user', content: 'Hello! I am ready to begin the interview.' }
                ],
                temperature: 0.7,
            });

            return completion.choices[0]?.message?.content || 'Hello! What does a perfect Sunday look like for you?';
        } catch (error: any) {
            this._logger.error('Failed to generate opening question', error);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'AI Service failed to generate an opening question.');
        }
    }

    async generateFollowUpQuestion(context: CastingUserContextDto, transcript: TranscriptEntry[]): Promise<string> {
        try {
            const messages: any[] = [
                { role: 'system', content: this._buildSystemPrompt(context) }
            ];

            // Rehydrate the conversation history
            for (const entry of transcript) {
                messages.push({
                    role: entry.role === 'ai' ? 'assistant' : 'user',
                    content: entry.content
                });
            }

            const completion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages,
                temperature: 0.7,
            });

            return completion.choices[0]?.message?.content || 'That is fascinating. Tell me more about how that impacts your relationships?';
        } catch (error: any) {
            this._logger.error('Failed to generate follow up question', error);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'AI Service failed to generate a follow-up question.');
        }
    }

    async extractSummaryAndVector(context: CastingUserContextDto, transcript: TranscriptEntry[]): Promise<{ aiSummary: string; personalityVector: number[]; }> {
        try {
            // 1. Generate the concise psycological summary
            const summaryPrompt = `
                Review the following interview transcript and the user's initial context.
                Provide a concise, 3-sentence psychological summary of the user's personality, core values, and attachment style.
                Do not include any greetings or conversational filler.
            `;

            const messages: any[] = [
                { role: 'system', content: summaryPrompt },
                { role: 'user', content: `Context: ${JSON.stringify}\n\nTranscript: ${JSON.stringify(transcript)}` }
            ];

            const summaryCompletion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages,
                temperature: 0.5,
            });

            const aiSummary = summaryCompletion.choices[0]?.message?.content || 'An introspective individual valuing deep connections.';

            // 2. Generate the Vector Embedding for the RAG search using OpenRouter's passthrough
            const embeddingResponse = await this._client.embeddings.create({
                model: this._embdedingModel,
                input: aiSummary,
            });

            const personalityVector = embeddingResponse.data[0].embedding;

            return { aiSummary, personalityVector };
        } catch (error: any) {
            this._logger.error('Failed to generate summary and vector', error);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'AI Service failed to process final interview data.');
        }
    }
}