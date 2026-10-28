import { BioGenerationContext } from '../interfaces/ai-service.interface';

export const BioPrompts = {
    getSystemPrompt: (): string => {
        return `
You are an expert dating profile writer.
Based on the user's demographic, lifestyle, and selected traits, generate exactly 3 distinct, highly engaging dating bios.
Keep each bio under 250 characters. Make them natural, witty, and genuine.
Return ONLY a valid JSON array containing exactly 3 strings (e.g. ["bio 1", "bio 2", "bio 3"]).
Do not include markdown formatting, backticks, or any explanation.
        `.trim();
    },

    getUserPrompt: (context: BioGenerationContext): string => {
        return `User Context:\n${JSON.stringify(context, null, 2)}`;
    },
};
