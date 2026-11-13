import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { SimulationType } from "../../domain/enums/scene-partner.enums";

export class StartSceneSessionDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    scenarioId!: string;

    @IsEnum(SimulationType)
    @IsNotEmpty()
    simulationType!: SimulationType;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    targetUserId?: string;
}
