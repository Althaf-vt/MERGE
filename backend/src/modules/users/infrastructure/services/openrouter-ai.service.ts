import { Injectable, Logger } from "@nestjs/common";
import { BioGenerationContext, IAiService } from "../../domain/interfaces/ai-service.interface";
import OpenAI from "openai";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";

@Injectable()
export class OpenRouterAiService implements IAiService{
    private readonly _client: OpenAI;
    private readonly _logger = new Logger(OpenRouterAiService.name);

    constructor(){
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            this._logger.error('CRITICAL: OPENROUTER_API_KEY is missing from environment variables.');
        }
        
        const appUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
        const appTitle = process.env.APP_NAME || 'MERGE Platform';
        
        // Configure standart OpenAi client to route through OpenRouter
        this._client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey || '',
            defaultHeaders: {
                'HTTP-Referer': appUrl,
                'X-Title': appTitle,
            },
        });
    }
    // Sends demographic and personality context to the LLM to generate bio options.
    async generateDatingBios(promptContext: BioGenerationContext): Promise<string[]> {
        try {
            // Define persona instructions and strict JSON formatting constraints.
            const systemInstruction = `
                You are an expert dating profile writer. 
                Based on the user's demographic, lifestyle, and selected traits, generate exactly 3 distinct, highly engaging dating bios.
                Keep each bio under 250 characters. Make them natural, witty, and genuine.
                Return ONLY a valid JSON array containing exactly 3 strings (e.g. ["bio 1", "bio 2", "bio 3"]). 
                Do not include markdown formatting, backticks, or any explanation.
            `;

            // openrouter/free automatically selects an active free model with available quota
            const completion = await this._client.chat.completions.create({
                model: "openrouter/free",
                messages: [
                    {role: "system", content: systemInstruction},
                    {role: "user", content: `User Context:\n${JSON.stringify(promptContext, null, 2)}`}
                ],
                temperature: 0.7,
            })

            const rawContent = completion.choices[0]?.message?.content || "[]";

            // Extract only the JSON array or object substring from the raw output.
            const jsonMatch = rawContent.match(/\[[\s\S]*\]/) || rawContent.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                // Fallback: parse lines if the model returned plain text lines without brackets
                const lines = rawContent
                    .split('\n')
                    .map((line) => line.replace(/^[-*0-9.)\s]+/, '').trim())
                    .filter((line) => line.length > 20 && !line.toLowerCase().startsWith('user safety:'));

                if (lines.length >= 3) {
                    return lines.slice(0, 3);
                }
                throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'LLM response did not contain a valid JSON array or extractable bios.');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Normalize response into a string array regardless of structure
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item).trim()).filter(Boolean);
            }
            if (parsed.bios && Array.isArray(parsed.bios)) {
                return parsed.bios.map((item: any) => String(item).trim()).filter(Boolean);
            }

            return Object.values(parsed).filter((val): val is string => typeof val === 'string');
        } catch (error: any) {
            this._logger.error('OpenRouter Service Error Details:', error);
            throw new DomainException(
                ErrorCode.INTERNAL_SERVER_ERROR,
                error?.message || 'Failed to generate bios from AI service.'
            );
        }
    }
}