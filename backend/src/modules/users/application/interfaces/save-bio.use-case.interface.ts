import { SaveBioDto } from "../dtos/save-bio.dto";

export const SAVE_BIO_USE_CASE = Symbol("SAVE_BIO_USE_CASE");

export interface ISaveBioUseCase{
    execute(userId: string, payload: SaveBioDto): Promise<{
        success: boolean;
        message: string;
    }>
}