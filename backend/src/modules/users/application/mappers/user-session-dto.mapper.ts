import { UserSessionData } from "../../../../shared/domain/interfaces/user-session.interface";
import { ActiveSessionResponseDto } from "../dtos/security-management.dto";

export class UserSessionDtoMapper {
    public static toResponseDto(session: UserSessionData, currentSessionId: string): ActiveSessionResponseDto {
        return {
            sessionId: session.sessionId,
            deviceInfo: session.deviceInfo,
            ipAddress: session.ipAddress,
            lastActive: session.lastActive,
            createdAt: session.createdAt,
            isCurrentSession: session.sessionId === currentSessionId,
        };
    }

    public static toResponseDtoList(sessions: UserSessionData[], currentSessionId: string): ActiveSessionResponseDto[] {
        return sessions.map((session) => UserSessionDtoMapper.toResponseDto(session, currentSessionId));
    }
}
