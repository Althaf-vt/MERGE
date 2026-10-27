import { IsEnum, IsNotEmpty } from "class-validator";
import { LivenessPrompt } from "../../domain/enums/user.enums";

export class SubmitLivenessCheckDto {
    @IsEnum(LivenessPrompt, { message: "Invalid liveness prompt type" })
    @IsNotEmpty({ message: "Liveness prompt type is required" })
    promptType: LivenessPrompt;
}