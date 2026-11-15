import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";
import { ScenarioCategory, SceneSessionStatus } from "../../../../shared/domain/enums/scene-partner.enums";
import { SCENE_PARTNER_POLICY } from "../../domain/constants/scene-partner.constants";
import { SceneTurnResponseDto } from "./scene-session-response.dto";

export class StartScenePreviewDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    scenarioId?: string;

    @ValidateIf((o) => !o.scenarioId)
    @IsString()
    @IsNotEmpty()
    @MaxLength(SCENE_PARTNER_POLICY.MAX_SCENARIO_TITLE_LENGTH)
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    title?: string;

    @IsOptional()
    @IsEnum(ScenarioCategory)
    category?: ScenarioCategory;

    @ValidateIf((o) => !o.scenarioId)
    @IsString()
    @IsNotEmpty()
    @MaxLength(SCENE_PARTNER_POLICY.MAX_SCENARIO_PROMPT_LENGTH)
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    promptContext?: string;

    @IsOptional()
    @IsBoolean()
    isCoachingEnabled?: boolean;
}

export class SendScenePreviewTurnDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(SCENE_PARTNER_POLICY.MAX_MESSAGE_LENGTH)
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    content!: string;
}

export interface ScenePreviewResponseDto {
    id: string;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    scenarioPromptContext: string | null;
    isCoachingEnabled: boolean;
    status: SceneSessionStatus;
    transcript: SceneTurnResponseDto[];
    turnCount: number;
    isPreview: boolean;
    createdAt: Date;
    updatedAt: Date;
}
