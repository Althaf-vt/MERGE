import { Inject, Injectable } from "@nestjs/common";
import { IUpdateScenarioUseCase } from "../interfaces/scene-partner-admin.use-cases.interface";
import { AdminUpdateScenarioParams } from "../interfaces/scene-partner-admin-facade.interface";
import { AdminScenarioResponseDto } from "../dtos/admin-scenario-response.dto";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { ScenarioDtoMapper } from "../mappers/scenario-dto.mapper";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";

@Injectable()
export class UpdateScenarioUseCase implements IUpdateScenarioUseCase {
    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
    ) { }

    async execute(id: string, params: AdminUpdateScenarioParams): Promise<AdminScenarioResponseDto> {
        const scenario = await this._scenarioRepository.findById(id);
        if (!scenario) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.SCENARIO_NOT_FOUND);
        }

        scenario.updateDetails({
            title: params.title ?? scenario.title,
            description: params.description ?? scenario.description,
            category: params.category ?? scenario.category,
            promptContext: params.promptContext ?? scenario.promptContext,
        });

        const updated = await this._scenarioRepository.update(scenario);
        return ScenarioDtoMapper.toAdminResponseDto(updated);
    }
}
