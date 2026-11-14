import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";
import {
    GenerateTurnResult,
    IScenePartnerAiService,
    SceneSessionSummaryData,
    SceneSimulationContext,
} from "../../domain/interfaces/scene-partner-ai.interface";
import { SceneTurnSnapshot } from "../../domain/interfaces/scene-session.types";
import { CoachNoteProps } from "../../domain/value-objects/coach-note.vo";
import { PersonaPrompt } from "../../domain/prompts/persona.prompt";
import { CoachEvaluationRawResult, CoachPrompt } from "../../domain/prompts/coach.prompt";
import { SessionSummaryPrompt } from "../../domain/prompts/session-summary.prompt";
import { SceneSpeakerRole } from "../../domain/enums/scene-partner.enums";
import { OPENROUTER_HEADERS } from "../../../../shared/infrastructure/constants/ai-protocol.constant";

@Injectable()
export class OpenRouterScenePartnerAiService implements IScenePartnerAiService {
    private readonly _logger = new Logger(OpenRouterScenePartnerAiService.name);
    private readonly _client: OpenAI;
    private readonly _chatModel: string;
    private readonly _personaTemperature: number;
    private readonly _coachTemperature: number;

    constructor() {
        const apiKey = EnvConfig.ai.apiKey;
        if (!apiKey || apiKey.trim().length === 0) {
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, "OPENROUTER_API_KEY is missing from environment variables.");
        }

        this._chatModel = EnvConfig.ai.chatModel;
        this._personaTemperature = EnvConfig.ai.chatTemperature;
        this._coachTemperature = EnvConfig.ai.summaryTemperature;

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

    public async generateInitialGreeting(context: SceneSimulationContext): Promise<string> {
        try {
            return await this._generatePersonaGreeting(context);
        } catch (error) {
            this._handleAiError(error);
        }
    }

    public async generateTurn(
        context: SceneSimulationContext,
        userMessage: string,
        transcript: SceneTurnSnapshot[]
    ): Promise<GenerateTurnResult> {
        try {
            // Asynchronous Dual-Agent Architecture: Concurrent execution with Promise.all
            const [personaReply, coachNote] = await Promise.all([
                this._generatePersonaReply(context, userMessage, transcript),
                this._generateCoachFeedback(context, userMessage, transcript),
            ]);

            return {
                personaReply,
                coachNote,
            };
        } catch (error) {
            this._handleAiError(error);
        }
    }

    public async generateSessionSummary(
        context: SceneSimulationContext,
        transcript: SceneTurnSnapshot[]
    ): Promise<SceneSessionSummaryData> {
        const fallback: SceneSessionSummaryData = {
            summary: `You completed your practice rehearsal session for ${context.scenarioTitle}.`,
            takeaways: ['You showed politeness and willingness to practice conversational scenarios.'],
            thingsToNote: ['Offer more specific personal details and ask follow-up questions to build reciprocal momentum.'],
            coachingNotes: 'You made a good initial rehearsal. Focus on sharing more about your own perspective and proactively inquiring about your partner to spark deeper connection.',
            communicationScore: 50,
        };

        try {
            return await this._retryWithBackoff(async () => {
                const completion = await this._client.chat.completions.create({
                    model: this._chatModel,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert dating communication coach on MERGE. Return valid JSON only conforming to the requested schema.',
                        },
                        {
                            role: 'user',
                            content: SessionSummaryPrompt.getPrompt(context, transcript),
                        },
                    ],
                    temperature: this._coachTemperature,
                });

                const responseText = completion.choices[0]?.message?.content || '';
                return this._parseJson<SceneSessionSummaryData>(responseText, fallback);
            });
        } catch (error) {
            this._logger.warn(
                `OpenRouter session summary generation hit transient error: ${error instanceof Error ? error.message : String(error)}. Utilizing structured fallback summary.`
            );
            return fallback;
        }
    }

    private async _generatePersonaGreeting(context: SceneSimulationContext): Promise<string> {
        return this._retryWithBackoff(async () => {
            const completion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages: [
                    {
                        role: 'system',
                        content: PersonaPrompt.getSystemPrompt(context),
                    },
                    {
                        role: 'user',
                        content: PersonaPrompt.getInitialGreetingPrompt(context),
                    },
                ],
                temperature: this._personaTemperature,
            });

            const text = completion.choices[0]?.message?.content?.trim();
            return text || "Hey there! Really glad we connected. How is your day going?";
        });
    }

    private async _generatePersonaReply(
        context: SceneSimulationContext,
        userMessage: string,
        transcript: SceneTurnSnapshot[]
    ): Promise<string> {
        return this._retryWithBackoff(async () => {
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                {
                    role: 'system',
                    content: PersonaPrompt.getSystemPrompt(context),
                },
            ];

            for (const turn of transcript) {
                messages.push({
                    role: turn.role === SceneSpeakerRole.USER ? 'user' : 'assistant',
                    content: turn.content,
                });
            }

            messages.push({
                role: 'user',
                content: userMessage,
            });

            const completion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages,
                temperature: this._personaTemperature,
            });

            const reply = completion.choices[0]?.message?.content?.trim();
            return reply || "I hear you! That makes a lot of sense.";
        });
    }

    private async _generateCoachFeedback(
        context: SceneSimulationContext,
        userMessage: string,
        transcript: SceneTurnSnapshot[]
    ): Promise<CoachNoteProps | null> {
        try {
            return await this._retryWithBackoff(async () => {
                const completion = await this._client.chat.completions.create({
                    model: this._chatModel,
                    messages: [
                        {
                            role: 'system',
                            content: CoachPrompt.getSystemPrompt(context),
                        },
                        {
                            role: 'user',
                            content: CoachPrompt.getTurnEvaluationPrompt(userMessage, transcript, context),
                        },
                    ],
                    temperature: this._coachTemperature,
                });

                const rawText = completion.choices[0]?.message?.content || '';

                const fallback: CoachEvaluationRawResult = {
                    shouldIntervene: false,
                    observation: '',
                    tone: 'Natural',
                    pacing: 'Balanced',
                    nextTip: '',
                };

                const parsed = this._parseJson<CoachEvaluationRawResult>(rawText, fallback);

                // Anti-nagging / Selective intervention policy
                if (!parsed.shouldIntervene) {
                    return null;
                }

                if (!parsed.observation || parsed.observation.trim().length === 0) {
                    return null;
                }

                return {
                    observation: parsed.observation.trim(),
                    tone: parsed.tone?.trim() || 'Natural',
                    pacing: parsed.pacing?.trim() || 'Balanced',
                    nextTip: parsed.nextTip?.trim() || 'Continue exploring shared topics naturally.',
                };
            });
        } catch (error) {
            this._logger.warn(
                `Coach feedback generation temporarily unavailable: ${error instanceof Error ? error.message : String(error)}`
            );
            return null; // Gracefully degrade - omit coach note on transient error
        }
    }

    private async _retryWithBackoff<T>(
        operation: () => Promise<T>,
        maxRetries = 2,
        delayMs = 1000
    ): Promise<T> {
        let lastError: unknown;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                const message = error instanceof Error ? error.message : String(error);
                const isTransient =
                    message.includes('503') ||
                    message.includes('429') ||
                    message.includes('rate limit') ||
                    message.includes('overloaded');

                if (!isTransient || attempt === maxRetries) {
                    throw error;
                }

                this._logger.warn(
                    `OpenRouter transient error (attempt ${attempt + 1}/${maxRetries + 1}): ${message}. Retrying in ${delayMs}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(1.5, attempt)));
            }
        }
        throw lastError;
    }

    private _parseJson<T>(rawText: string, fallback: T): T {
        try {
            const cleaned = rawText
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .trim();
            const parsed = JSON.parse(cleaned) as T;
            return parsed;
        } catch (error) {
            this._logger.warn(`Failed to parse AI JSON response: ${error instanceof Error ? error.message : String(error)}`);
            return fallback;
        }
    }

    private _handleAiError(error: unknown): never {
        const message = error instanceof Error ? error.message : String(error);
        this._logger.error(`OpenRouter AI service error: ${message}`, error instanceof Error ? error.stack : undefined);

        if (message.includes('SAFETY') || message.includes('blocked')) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.AI_SAFETY_BLOCKED);
        }

        throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, SCENE_PARTNER_ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE);
    }
}

