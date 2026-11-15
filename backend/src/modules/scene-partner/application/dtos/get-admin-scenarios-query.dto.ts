import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";
import { AdminGetScenariosFilters } from "../interfaces/scene-partner-admin-facade.interface";

export class GetAdminScenariosQueryDto implements AdminGetScenariosFilters {
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
