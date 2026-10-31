import { SendPriorityIntroDto } from "../dtos/priority-intro.dto";

export const SEND_PRIORITY_INTRO_USE_CASE = 'SEND_PRIORITY_INTRO_USE_CASE';

export interface ISendPriorityIntroUseCase {
    execute(requesterId: string, dto: SendPriorityIntroDto): Promise<void>;
}