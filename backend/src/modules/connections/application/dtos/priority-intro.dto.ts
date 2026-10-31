import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import { PRIORITY_INTRO_CONSTANTS } from "../../domain/constants/priority-intro.constants";

export class SendPriorityIntroDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    targetUserId!: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @MaxLength(PRIORITY_INTRO_CONSTANTS.ICEBREAKER.MAX_LENGTH)
    icebreakerMessage!: string;
}