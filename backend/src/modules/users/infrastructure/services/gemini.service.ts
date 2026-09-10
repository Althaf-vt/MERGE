import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { BioGenerationContext, IAiService } from "../../domain/interfaces/ai-service.interface";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class GeminiService implements IAiService{
    private genAi: GoogleGenerativeAI;

    constructor(){
        // Initialize the SDK with the key from .env
        this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    async generateDatingBios(promptContext: BioGenerationContext): Promise<string[]> {
        try {
            // we use gemini-1.5-flash as it is fast, cheap, and excellent for text generatio
            const model = this.genAi.getGenerativeModel({model: 'gemini-1.5-flash'});

            const systemInstruction = `
                You are an expert dating profile writer. 
                Based on the user's demographic and selected traits, generate exactly 3 distinct, highly engaging dating bios.
                Keep each bio under 250 characters. Make them natural, witty, and genuine.
                Return ONLY a valid JSON array of strings. Do not include markdown formatting like \`\`\`json.
            `;

            const fullPrompt = `${systemInstruction}\n\nUser Context:\n${promptContext}`;

            const result = await model.generateContent(fullPrompt);
            const responseText = result.response.text();

            // Clean any potential markdown wrapping the AI might return
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanJson);
        } catch (error) {
            throw new InternalServerErrorException("Failed to generate bios from AI Service.")
        }
    }
}