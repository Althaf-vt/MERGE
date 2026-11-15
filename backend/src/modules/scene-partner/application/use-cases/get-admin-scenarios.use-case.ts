import { Inject, Injectable } from "@nestjs/common";
import { IGetAdminScenariosUseCase } from "../interfaces/scene-partner-admin.use-cases.interface";
import { GetAdminScenariosQueryDto } from "../dtos/get-admin-scenarios-query.dto";
import { PaginatedAdminScenariosResponseDto } from "../dtos/admin-scenario-response.dto";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { ScenarioDtoMapper } from "../mappers/scenario-dto.mapper";

@Injectable()
export class GetAdminScenariosUseCase implements IGetAdminScenariosUseCase {
    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
    ) { }

    async execute(query: GetAdminScenariosQueryDto): Promise<PaginatedAdminScenariosResponseDto> {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.max(1, query.limit ?? 20);
        const skip = (page - 1) * limit;

        const result = await this._scenarioRepository.findAllAdmin({
            category: query.category,
            isActive: query.isActive,
            search: query.search,
            limit,
            skip,
        });

        return {
            data: ScenarioDtoMapper.toAdminResponseDtoList(result.data),
            total: result.total,
            page,
            limit,
        };
    }
}
