import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
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

@Injectable()
export class GeminiScenePartnerAiService implements IScenePartnerAiService {
    private readonly _logger = new Logger(GeminiScenePartnerAiService.name);
    private readonly _genAi: GoogleGenerativeAI;
    private readonly _modelName: string;
    private readonly _personaTemperature: number;
    private readonly _coachTemperature: number;

    private readonly _safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    constructor() {
        const apiKey = EnvConfig.gemini.apiKey;
        if (!apiKey || apiKey.trim().length === 0) {
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, SCENE_PARTNER_ERROR_MESSAGES.AI_CONFIG_ERROR);
        }

        this._genAi = new GoogleGenerativeAI(apiKey);
        this._modelName = EnvConfig.gemini.model;
        this._personaTemperature = EnvConfig.gemini.personaTemperature;
        this._coachTemperature = EnvConfig.gemini.coachTemperature;
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
            summary: `Completed practice rehearsal session for ${context.scenarioTitle}.`,
            takeaways: ['Showed politeness and willingness to practice conversational scenarios.'],
            thingsToNote: ['Offer more specific personal details and ask follow-up questions to build reciprocal momentum.'],
            coachingNotes: 'A good initial rehearsal. Focus on sharing more about your own perspective and proactively inquiring about your partner to spark deeper connection.',
            communicationScore: 50,
        };

        try {
            return await this._retryWithBackoff(async () => {
                const model = this._genAi.getGenerativeModel({
                    model: this._modelName,
                    generationConfig: {
                        temperature: this._coachTemperature,
                    },
                    safetySettings: this._safetySettings,
                });

                const prompt = SessionSummaryPrompt.getPrompt(context, transcript);
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();

                return this._parseJson<SceneSessionSummaryData>(responseText, fallback);
            });
        } catch (error) {
            this._logger.warn(
                `Session summary generation hit transient error: ${error instanceof Error ? error.message : String(error)}. Utilizing structured fallback summary.`
            );
            return fallback;
        }
    }

    private async _generatePersonaGreeting(context: SceneSimulationContext): Promise<string> {
        return this._retryWithBackoff(async () => {
            const model = this._genAi.getGenerativeModel({
                model: this._modelName,
                systemInstruction: PersonaPrompt.getSystemPrompt(context),
                generationConfig: {
                    temperature: this._personaTemperature,
                },
                safetySettings: this._safetySettings,
            });

            const prompt = PersonaPrompt.getInitialGreetingPrompt(context);
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        });
    }

    private async _generatePersonaReply(
        context: SceneSimulationContext,
        userMessage: string,
        transcript: SceneTurnSnapshot[]
    ): Promise<string> {
        return this._retryWithBackoff(async () => {
            const model = this._genAi.getGenerativeModel({
                model: this._modelName,
                systemInstruction: PersonaPrompt.getSystemPrompt(context),
                generationConfig: {
                    temperature: this._personaTemperature,
                },
                safetySettings: this._safetySettings,
            });

            const formattedHistory = PersonaPrompt.formatTranscript(transcript);
            const chat = model.startChat({
                history: formattedHistory,
            });

            const result = await chat.sendMessage(userMessage);
            return result.response.text().trim();
        });
    }

    private async _generateCoachFeedback(
        context: SceneSimulationContext,
        userMessage: string,
        transcript: SceneTurnSnapshot[]
    ): Promise<CoachNoteProps | null> {
        try {
            return await this._retryWithBackoff(async () => {
                const model = this._genAi.getGenerativeModel({
                    model: this._modelName,
                    systemInstruction: CoachPrompt.getSystemPrompt(context),
                    generationConfig: {
                        temperature: this._coachTemperature,
                    },
                    safetySettings: this._safetySettings,
                });

                const prompt = CoachPrompt.getTurnEvaluationPrompt(userMessage, transcript, context);
                const result = await model.generateContent(prompt);
                const text = result.response.text();

                const fallback: CoachEvaluationRawResult = {
                    shouldIntervene: false,
                    observation: '',
                    tone: 'Natural',
                    pacing: 'Balanced',
                    nextTip: '',
                };

                const parsed = this._parseJson<CoachEvaluationRawResult>(text, fallback);

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
        delayMs = 1200
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
                    message.includes('high demand') ||
                    message.includes('ResourceExhausted') ||
                    message.includes('429');

                if (!isTransient || attempt === maxRetries) {
                    throw error;
                }

                this._logger.warn(
                    `Gemini transient overload (attempt ${attempt + 1}/${maxRetries + 1}): ${message}. Retrying in ${delayMs}ms...`
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
        this._logger.error(`Gemini AI service error: ${message}`, error instanceof Error ? error.stack : undefined);

        if (message.includes('SAFETY') || message.includes('blocked')) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.AI_SAFETY_BLOCKED);
        }

        throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, SCENE_PARTNER_ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE);
    }
}
