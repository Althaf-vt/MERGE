import { SendPriorityIntroDto, TargetUserDto } from "../dtos/connection.dto";

export const SEND_CONNECTION_REQUEST_USE_CASE = 'SEND_CONNECTION_REQUEST_USE_CASE';
export interface ISendConnectionRequestUseCase {
    execute(requesterId: string, dto: TargetUserDto): Promise<void>;
}

export const SEND_PRIORITY_INTRO_USE_CASE = 'SEND_PRIORITY_INTRO_USE_CASE';
export interface ISendPriorityIntroUseCase {
    execute(requesterId: string, dto: SendPriorityIntroDto): Promise<void>;
}

export const ACCEPT_CONNECTION_USE_CASE = 'ACCEPT_CONNECTION_USE_CASE';
export interface IAcceptConnectionUseCase {
    execute(userId: string, connectionId: string): Promise<void>;
}

export const DECLINE_CONNECTION_USE_CASE = 'DECLINE_CONNECTION_USE_CASE';
export interface IDeclineConnectionUseCase {
    execute(userId: string, connectionId: string): Promise<void>;
}

export const CANCEL_CONNECTION_USE_CASE = 'CANCEL_CONNECTION_USE_CASE';
export interface ICancelConnectionUseCase {
    execute(userId: string, connectionId: string): Promise<void>;
}

export const REVOKE_MATCH_USE_CASE = 'REVOKE_MATCH_USE_CASE';
export interface IRevokeMatchUseCase {
    execute(userId: string, connectionId: string): Promise<void>;
}