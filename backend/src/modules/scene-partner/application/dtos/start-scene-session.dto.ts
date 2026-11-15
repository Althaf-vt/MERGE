import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";
import { SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";
import { SCENE_PARTNER_POLICY } from "../../domain/constants/scene-partner.constants";

export class StartSceneSessionDto {
    @ValidateIf((o) => !o.customPrompt)
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    scenarioId?: string;

    @IsEnum(SimulationType)
    @IsNotEmpty()
    simulationType!: SimulationType;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    targetUserId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(SCENE_PARTNER_POLICY.MAX_SCENARIO_PROMPT_LENGTH)
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    customPrompt?: string;

    @IsOptional()
    @IsString()
    @MaxLength(SCENE_PARTNER_POLICY.MAX_SCENARIO_TITLE_LENGTH)
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    customTitle?: string;

    @IsOptional()
    @IsBoolean()
    isCoachingEnabled?: boolean;
}
