import { IsEnum, IsOptional } from "class-validator";
import { ScenarioCategory } from "../../domain/enums/scene-partner.enums";

export class GetScenariosQueryDto {
    @IsOptional()
    @IsEnum(ScenarioCategory)
    category?: ScenarioCategory;
}
