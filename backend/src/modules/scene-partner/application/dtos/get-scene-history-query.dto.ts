import { IsNumber, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetSceneHistoryQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    skip?: number = 0;
}

