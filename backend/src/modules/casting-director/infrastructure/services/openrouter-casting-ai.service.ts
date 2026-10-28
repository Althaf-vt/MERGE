import { Injectable, Logger } from "@nestjs/common";
import { ICastingAiService } from "../../domain/interfaces/casting-ai-service.interface";
import OpenAI from 'openai';
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { ICastingUserContext } from "../../domain/interfaces/casting-user-context.interface";
import { TranscriptEntry } from "../../domain/entities/casting-session.entity";
import { TranscriptRole } from "../../domain/enums/casting.enums";
import { CastingPrompts } from "../../domain/prompts/casting.prompts";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
import { AI_MESSAGE_ROLE, OPENROUTER_HEADERS } from "../../../../shared/infrastructure/constants/ai-protocol.constant";

@Injectable()
export class OpenRouterCastingAiService implements ICastingAiService {
    private readonly _client: OpenAI;
    private readonly _logger = new Logger(OpenRouterCastingAiService.name);
    private readonly _chatModel: string;
    private readonly _embeddingModel: string;
    private readonly _chatTemperature: number;
    private readonly _summaryTemperature: number;

    constructor() {
        const apiKey = EnvConfig.ai.apiKey;
        if (!apiKey || apiKey.trim().length === 0) {
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, "OPENROUTER_API_KEY is missing.");
        }

        this._chatModel = EnvConfig.ai.chatModel;
        this._embeddingModel = EnvConfig.ai.embeddingModel;
        this._chatTemperature = EnvConfig.ai.chatTemperature;
        this._summaryTemperature = EnvConfig.ai.summaryTemperature;

        const appUrl = EnvConfig.app.frontendUrl;
        const appTitle = EnvConfig.app.name;

        this._client = new OpenAI({
            baseURL: EnvConfig.ai.baseUrl,
            apiKey: apiKey,
            defaultHeaders: {
                [OPENROUTER_HEADERS.REFERER]: appUrl,
                [OPENROUTER_HEADERS.TITLE]: appTitle,
            },
        });
    }

    private _mapTranscriptRoleToAiRole(role: TranscriptRole): 'assistant' | 'user' {
        switch (role) {
            case TranscriptRole.AI:
                return AI_MESSAGE_ROLE.ASSISTANT;
            case TranscriptRole.USER:
                return AI_MESSAGE_ROLE.USER;
            default:
                return AI_MESSAGE_ROLE.USER;
        }
    }

    async generateOpeningQuestion(context: ICastingUserContext): Promise<string> {
        try {
            const completion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages: [
                    { role: AI_MESSAGE_ROLE.SYSTEM, content: CastingPrompts.getSystemPrompt(context) },
                    { role: AI_MESSAGE_ROLE.USER, content: CastingPrompts.getOpeningUserPrompt() }
                ],
                temperature: this._chatTemperature,
            });

            return completion.choices[0]?.message?.content || 'Hello! What does a perfect Sunday look like for you?';
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this._logger.error(`Failed to generate opening question: ${errorMessage}`);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'AI Service failed to generate an opening question.');
        }
    }

    async generateFollowUpQuestion(context: ICastingUserContext, transcript: TranscriptEntry[]): Promise<string> {
        try {
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: AI_MESSAGE_ROLE.SYSTEM, content: CastingPrompts.getSystemPrompt(context) }
            ];

            // Rehydrate the conversation history
            for (const entry of transcript) {
                messages.push({
                    role: this._mapTranscriptRoleToAiRole(entry.role),
                    content: entry.content
                });
            }

            const completion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages,
                temperature: this._chatTemperature,
            });

            return completion.choices[0]?.message?.content || 'That is fascinating. Tell me more about how that impacts your relationships?';
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this._logger.error(`Failed to generate follow up question: ${errorMessage}`);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'AI Service failed to generate a follow-up question.');
        }
    }

    async extractSummaryAndVector(context: ICastingUserContext, transcript: TranscriptEntry[]): Promise<{ aiSummary: string; personalityVector: number[]; }> {
        try {
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: AI_MESSAGE_ROLE.SYSTEM, content: CastingPrompts.getSummarySystemPrompt() },
                { role: AI_MESSAGE_ROLE.USER, content: CastingPrompts.getSummaryUserPrompt(context, transcript) }
            ];

            const summaryCompletion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages,
                temperature: this._summaryTemperature,
            });

            const aiSummary = summaryCompletion.choices[0]?.message?.content || 'An introspective individual valuing deep connections.';

            // Generate the Vector Embedding for the RAG search using OpenRouter's passthrough
            const embeddingResponse = await this._client.embeddings.create({
                model: this._embeddingModel,
                input: aiSummary,
            });

            const personalityVector = embeddingResponse.data[0].embedding;

            return { aiSummary, personalityVector };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this._logger.error(`Failed to generate summary and vector: ${errorMessage}`);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'AI Service failed to process final interview data.');
        }
    }
}