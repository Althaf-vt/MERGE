// backend/src/modules/casting-director/infrastructure/services/openrouter-casting-ai.service.ts

import { Injectable, Logger } from "@nestjs/common";
import { ICastingAiService } from "../../domain/interfaces/casting-ai-service.interface";
import OpenAI from 'openai';
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { CastingUserContextDto } from "../../../users/application/dtos/casting-user-context.dto";
import { TranscriptEntry } from "../../domain/entities/casting-session.entity";
import { CastingPrompts } from "../../domain/prompts/casting.prompts";

@Injectable()
export class OpenRouterCastingAiService implements ICastingAiService {
    private readonly _client: OpenAI;
    private readonly _logger = new Logger(OpenRouterCastingAiService.name);

    // We use the free router for chat to bypass traffic/billing limits during dev
    private readonly _chatModel = 'openrouter/free';

    // we use an OpenRouter supported embedding model for the RAG vector
    private readonly _embeddingModel = 'openai/text-embedding-3-small';

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

    async generateOpeningQuestion(context: CastingUserContextDto): Promise<string> {
        try {
            const completion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages: [
                    { role: 'system', content: CastingPrompts.getSystemPrompt(context) },
                    { role: 'user', content: CastingPrompts.getOpeningUserPrompt() }
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
                { role: 'system', content: CastingPrompts.getSystemPrompt(context) }
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
            const messages: any[] = [
                { role: 'system', content: CastingPrompts.getSummarySystemPrompt() },
                { role: 'user', content: CastingPrompts.getSummaryUserPrompt(context, transcript) }
            ];

            const summaryCompletion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages,
                temperature: 0.5,
            });

            const aiSummary = summaryCompletion.choices[0]?.message?.content || 'An introspective individual valuing deep connections.';

            // Generate the Vector Embedding for the RAG search using OpenRouter's passthrough
            const embeddingResponse = await this._client.embeddings.create({
                model: this._embeddingModel,
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