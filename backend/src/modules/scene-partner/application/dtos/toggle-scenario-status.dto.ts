import { IsBoolean, IsNotEmpty } from "class-validator";

export class ToggleScenarioStatusDto {
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}
