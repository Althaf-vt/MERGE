export const CASTING_AI_SERVICE = 'CASTING_AI_SERVICE';

export interface ICastingAiService {
    generateOpeningQuestion(context: any): Promise<string>;
}