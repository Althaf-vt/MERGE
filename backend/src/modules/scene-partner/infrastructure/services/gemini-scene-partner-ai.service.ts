import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
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
        try {
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

            const fallback: SceneSessionSummaryData = {
                summary: `Completed practice rehearsal session for ${context.scenarioTitle}.`,
                thingsToNote: ['Engaged thoughtfully throughout the scenario.'],
                takeaways: ['Keep practicing active listening and asking open-ended questions.'],
                coachingNotes: 'Great effort in completing this scenario. Continue refining your natural conversation pace.',
                communicationScore: 80,
            };

            return this._parseJson<SceneSessionSummaryData>(responseText, fallback);
        } catch (error) {
            this._handleAiError(error);
        }
    }

    private async _generatePersonaGreeting(context: SceneSimulationContext): Promise<string> {
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
    }

    private async _generatePersonaReply(
        context: SceneSimulationContext,
        userMessage: string,
        transcript: SceneTurnSnapshot[]
    ): Promise<string> {
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
    }

    private async _generateCoachFeedback(
        context: SceneSimulationContext,
        userMessage: string,
        transcript: SceneTurnSnapshot[]
    ): Promise<CoachNoteProps | null> {
        const model = this._genAi.getGenerativeModel({
            model: this._modelName,
            systemInstruction: CoachPrompt.getSystemPrompt(context),
            generationConfig: {
                temperature: this._coachTemperature,
            },
            safetySettings: this._safetySettings,
        });

        const prompt = CoachPrompt.getTurnEvaluationPrompt(userMessage, transcript);
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

