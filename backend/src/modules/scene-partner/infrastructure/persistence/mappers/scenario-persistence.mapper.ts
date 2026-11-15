import { Scenario } from "../../../domain/entities/scenario.entity";
import { ScenarioCategory } from "../../../../../shared/domain/enums/scene-partner.enums";
import { ScenarioDocument } from "../scenario.schema";

export class ScenarioPersistenceMapper {
    public static toDomain(raw: ScenarioDocument): Scenario {
        return new Scenario({
            id: raw._id ? raw._id.toString() : "",
            title: raw.title,
            description: raw.description,
            category: raw.category as ScenarioCategory,
            promptContext: raw.promptContext,
            isCustom: raw.isCustom ?? false,
            isActive: raw.isActive ?? true,
            creatorUserId: raw.creatorUserId ?? null,
            createdAt: raw["createdAt"],
            updatedAt: raw["updatedAt"],
        });
    }

    public static toPersistence(entity: Scenario): Record<string, unknown> {
        const data = entity.toJSON();
        return {
            _id: data.id,
            title: data.title,
            description: data.description,
            category: data.category,
            promptContext: data.promptContext,
            isCustom: data.isCustom,
            isActive: data.isActive,
            creatorUserId: data.creatorUserId ?? null,
        };
    }
}
