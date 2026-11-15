import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { ScenarioCategory, SceneSessionStatus, SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";
import {
    AdminCreateScenarioParams,
    AdminExportScenariosFilters,
    AdminGetScenariosFilters,
    AdminGetSessionsFilters,
    AdminSendPreviewTurnParams,
    AdminStartPreviewSessionParams,
    AdminToggleScenarioStatusParams,
    AdminUpdateScenarioParams,
} from "../../../scene-partner/application/interfaces/scene-partner-admin-facade.interface";

export class AdminCreateScenarioDto implements AdminCreateScenarioParams {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(500)
    description: string;

    @IsEnum(ScenarioCategory)
    @IsNotEmpty()
    category: ScenarioCategory;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(1000)
    promptContext: string;
}

export class AdminUpdateScenarioDto implements AdminUpdateScenarioParams {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
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
    @MinLength(10)
    @MaxLength(1000)
    promptContext?: string;
}

export class AdminToggleScenarioStatusDto implements AdminToggleScenarioStatusParams {
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}

export class AdminGetScenariosQueryDto implements AdminGetScenariosFilters {
    @IsOptional()
    @IsEnum(ScenarioCategory)
    category?: ScenarioCategory;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return undefined;
    })
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;
}

export class AdminGetSessionsQueryDto implements AdminGetSessionsFilters {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    scenarioId?: string;

    @IsOptional()
    @IsEnum(SimulationType)
    simulationType?: SimulationType;

    @IsOptional()
    @IsEnum(SceneSessionStatus)
    status?: SceneSessionStatus;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;
}

export class AdminStartPreviewDto implements AdminStartPreviewSessionParams {
    @IsOptional()
    @IsString()
    scenarioId?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    title?: string;

    @IsOptional()
    @IsEnum(ScenarioCategory)
    category?: ScenarioCategory;

    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    promptContext?: string;

    @IsOptional()
    @IsBoolean()
    isCoachingEnabled?: boolean;
}

export class AdminSendPreviewTurnDto implements AdminSendPreviewTurnParams {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content: string;
}

export enum ScenarioExportFormat {
    JSON = 'json',
    CSV = 'csv',
}

export class AdminExportScenariosQueryDto implements AdminExportScenariosFilters {
    @IsOptional()
    @IsEnum(ScenarioExportFormat)
    format?: ScenarioExportFormat = ScenarioExportFormat.JSON;

    @IsOptional()
    @IsEnum(ScenarioCategory)
    category?: ScenarioCategory;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return undefined;
    })
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === "false" || value === false) return false;
        if (value === "true" || value === true) return true;
        return undefined;
    })
    @IsBoolean()
    includeMetrics?: boolean = true;
}

