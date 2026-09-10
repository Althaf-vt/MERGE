import { GenerateBioDto } from "../dtos/generate-bio.dto";

export const GENERATE_BIO_USE_CASE = Symbol('GENERATE_BIO_USE_CASE');

// Return shape for the bio generation
export interface GeneratebioResult{
    success: boolean;
    bios: string[];
    remainingAttempts: number;
}

// Contract defining the execution method
export interface IGenerateBioUseCase{
    execute(userId: string, payload: GenerateBioDto): Promise<GeneratebioResult>;
}