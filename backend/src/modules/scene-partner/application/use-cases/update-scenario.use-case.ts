import { Inject, Injectable } from "@nestjs/common";
import { IUpdateScenarioUseCase } from "../interfaces/scene-partner-admin.use-cases.interface";
import { UpdateScenarioDto } from "../dtos/update-scenario.dto";
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

    async execute(id: string, dto: UpdateScenarioDto): Promise<AdminScenarioResponseDto> {
        const scenario = await this._scenarioRepository.findById(id);
        if (!scenario) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.SCENARIO_NOT_FOUND);
        }

        scenario.updateDetails({
            title: dto.title ?? scenario.title,
            description: dto.description ?? scenario.description,
            category: dto.category ?? scenario.category,
            promptContext: dto.promptContext ?? scenario.promptContext,
        });

        const updated = await this._scenarioRepository.update(scenario);
        return ScenarioDtoMapper.toAdminResponseDto(updated);
    }
}
