import { Inject, Injectable } from "@nestjs/common";
import { IGetAdminSessionDetailsUseCase } from "../interfaces/scene-partner-admin.use-cases.interface";
import { AdminSessionDetailDto } from "../dtos/admin-session-detail.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";

@Injectable()
export class GetAdminSessionDetailsUseCase implements IGetAdminSessionDetailsUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
    ) { }

    async execute(sessionId: string): Promise<AdminSessionDetailDto> {
        const session = await this._sessionRepository.findById(sessionId);
        if (!session) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.SESSION_NOT_FOUND);
        }

        return SceneSessionDtoMapper.toAdminDetailDto(session);
    }
}
