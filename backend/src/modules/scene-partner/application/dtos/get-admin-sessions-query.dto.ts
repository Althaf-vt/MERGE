import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { SceneSessionStatus, SimulationType } from "../../domain/enums/scene-partner.enums";

export class GetAdminSessionsQueryDto {
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
