import { IsBoolean, IsNotEmpty } from "class-validator";
import { AdminToggleScenarioStatusParams } from "../interfaces/scene-partner-admin-facade.interface";

export class ToggleScenarioStatusDto implements AdminToggleScenarioStatusParams {
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}
