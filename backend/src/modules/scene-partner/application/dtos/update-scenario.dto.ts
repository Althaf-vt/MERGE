import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";
import { SCENE_PARTNER_POLICY } from "../../domain/constants/scene-partner.constants";

export class UpdateScenarioDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(SCENE_PARTNER_POLICY.MIN_SCENARIO_TITLE_LENGTH)
    @MaxLength(SCENE_PARTNER_POLICY.MAX_SCENARIO_TITLE_LENGTH)
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsEnum(ScenarioCategory)
    category?: ScenarioCategory;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(SCENE_PARTNER_POLICY.MIN_SCENARIO_PROMPT_LENGTH)
    @MaxLength(SCENE_PARTNER_POLICY.MAX_SCENARIO_PROMPT_LENGTH)
    promptContext?: string;
}
