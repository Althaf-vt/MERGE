import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import { SCENE_PARTNER_POLICY } from "../../domain/constants/scene-partner.constants";

export class SendSceneTurnDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(SCENE_PARTNER_POLICY.MAX_MESSAGE_LENGTH)
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    content!: string;
}
