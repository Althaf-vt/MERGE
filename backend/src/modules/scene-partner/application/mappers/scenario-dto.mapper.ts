import { Scenario } from "../../domain/entities/scenario.entity";
import { AdminScenarioResponseDto } from "../dtos/admin-scenario-response.dto";
import { ScenarioResponseDto } from "../dtos/scenario-response.dto";

export class ScenarioDtoMapper {
    public static toAdminResponseDto(entity: Scenario): AdminScenarioResponseDto {
        const snapshot = entity.toJSON();
        return {
            id: snapshot.id,
            title: snapshot.title,
            description: snapshot.description,
            category: snapshot.category,
            promptContext: snapshot.promptContext,
            isCustom: snapshot.isCustom,
            isActive: snapshot.isActive,
            creatorUserId: snapshot.creatorUserId,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt,
        };
    }

    public static toAdminResponseDtoList(entities: Scenario[]): AdminScenarioResponseDto[] {
        return entities.map((entity) => ScenarioDtoMapper.toAdminResponseDto(entity));
    }

    public static toScenarioResponseDto(entity: Scenario): ScenarioResponseDto {
        const snapshot = entity.toJSON();
        return {
            id: snapshot.id,
            title: snapshot.title,
            description: snapshot.description,
            category: snapshot.category,
            promptContext: snapshot.promptContext,
            isCustom: snapshot.isCustom,
            creatorUserId: snapshot.creatorUserId,
            createdAt: snapshot.createdAt,
        };
    }

    public static toScenarioResponseDtoList(entities: Scenario[]): ScenarioResponseDto[] {
        return entities.map((entity) => ScenarioDtoMapper.toScenarioResponseDto(entity));
    }
}
