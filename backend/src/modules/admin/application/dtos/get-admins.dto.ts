import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class GetAdminsDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    search?: string;
}