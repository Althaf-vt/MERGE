import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdateCoachingModeDto {
    @IsBoolean()
    @IsNotEmpty()
    isCoachingEnabled!: boolean;
}
