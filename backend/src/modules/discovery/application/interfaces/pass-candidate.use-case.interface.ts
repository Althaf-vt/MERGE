import { PassCandidateDto } from "../dtos/discovery.dto";

export const PASS_CANDIDATE_USE_CASE = 'PASS_CANDIDATE_USE_CASE';

export interface IPassCandidateUseCase {
    execute(userId: string, dto: PassCandidateDto): Promise<void>;
}