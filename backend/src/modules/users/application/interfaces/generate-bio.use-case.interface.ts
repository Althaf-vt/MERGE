import { GenerateBioDto } from "../dtos/generate-bio.dto";

export const GENERATE_BIO_USE_CASE = Symbol('GENERATE_BIO_USE_CASE');

export interface GeneratebioResult {
    bios: string[];
    remainingAttempts: number;
}

export interface IGenerateBioUseCase {
    execute(userId: string, payload: GenerateBioDto): Promise<GeneratebioResult>;
}