export const AI_SERVICE = Symbol('AI_SERVICE');

// Assemble deep context for the AI prompt
export interface BioGenerationContext{
    age?: string;
    genderIdentity?: string;
    city?: string;
    relationshipGoal?: string;
    selectedTraits: string[] | undefined;
    interests: string[] | undefined;
}

export interface IAiService{
    generateDatingBios(promptContext: BioGenerationContext): Promise<string[]>;
}