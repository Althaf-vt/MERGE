import { Injectable, Logger } from "@nestjs/common";
import { BioGenerationContext, IAiService } from "../../domain/interfaces/ai-service.interface";
import OpenAI from "openai";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
import { AI_MESSAGE_ROLE, OPENROUTER_HEADERS } from "../../../../shared/infrastructure/constants/ai-protocol.constant";
import { BioPrompts } from "../../domain/prompts/bio.prompts";

@Injectable()
export class OpenRouterAiService implements IAiService {
    private readonly _client: OpenAI;
    private readonly _logger = new Logger(OpenRouterAiService.name);
    private readonly _chatModel: string;
    private readonly _temperature: number;

    constructor() {
        const apiKey = EnvConfig.ai.apiKey;
        if (!apiKey || apiKey.trim().length === 0) {
            this._logger.error('CRITICAL: OPENROUTER_API_KEY is missing from environment variables.');
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'OPENROUTER_API_KEY is required to boot the AI service.');
        }

        this._chatModel = EnvConfig.ai.bioModel;
        this._temperature = EnvConfig.ai.bioTemperature;

        const appUrl = EnvConfig.app.frontendUrl;
        const appTitle = EnvConfig.app.name;

        // Configure standard OpenAi client to route through OpenRouter
        this._client = new OpenAI({
            baseURL: EnvConfig.ai.baseUrl,
            apiKey: apiKey || '',
            defaultHeaders: {
                [OPENROUTER_HEADERS.REFERER]: appUrl,
                [OPENROUTER_HEADERS.TITLE]: appTitle,
            },
        });
    }

    // Sends demographic and personality context to the LLM to generate bio options.
    async generateDatingBios(promptContext: BioGenerationContext): Promise<string[]> {
        try {
            // openrouter/free automatically selects an active free model with available quota
            const completion = await this._client.chat.completions.create({
                model: this._chatModel,
                messages: [
                    { role: AI_MESSAGE_ROLE.SYSTEM, content: BioPrompts.getSystemPrompt() },
                    { role: AI_MESSAGE_ROLE.USER, content: BioPrompts.getUserPrompt(promptContext) }
                ],
                temperature: this._temperature,
            });

            const rawContent = completion.choices[0]?.message?.content || '';
            return this._parseBiosFromResponse(rawContent);

        } catch (error: unknown) {
            if (error instanceof DomainException) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown AI service failure';
            this._logger.error(`OpenRouter Service Error Details: ${errorMessage}`, error instanceof Error ? error.stack : undefined);

            throw new DomainException(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to generate bios from AI service. Please try again later.'
            );
        }
    }
    
    private _parseBiosFromResponse(rawContent: string): string[] {
        // 1. Clean markdown code fences if present (e.g. ```json ... ```)
        const cleaned = rawContent
            .replace(/```(?:json)?/gi, '')
            .replace(/```/g, '')
            .trim();

        // 2. Attempt JSON parsing directly or via bracket extraction
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/) || cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);

                if (Array.isArray(parsed)) {
                    return parsed.map((item: unknown) => String(item).trim()).filter(Boolean);
                }
                if (typeof parsed === 'object' && parsed !== null && 'bios' in parsed && Array.isArray((parsed as Record<string, unknown>).bios)) {
                    return (parsed as { bios: unknown[] }).bios.map((item: unknown) => String(item).trim()).filter(Boolean);
                }
                if (typeof parsed === 'object' && parsed !== null) {
                    return Object.values(parsed).filter((val): val is string => typeof val === 'string');
                }
            } catch {
                // JSON parsing failed; continue to line-based fallback below
            }
        }

        // 3. Fallback: line-by-line extraction for plain-text model responses
        const lines = cleaned
            .split('\n')
            .map((line) => line.replace(/^[-*0-9.)\s]+/, '').trim())
            .filter((line) => line.length > 20 && !line.toLowerCase().startsWith('user safety:'));

        if (lines.length >= 3) {
            return lines.slice(0, 3);
        }

        throw new DomainException(
            ErrorCode.INTERNAL_SERVER_ERROR,
            'LLM response did not contain a valid JSON array or extractable bios.'
        );
    }
}