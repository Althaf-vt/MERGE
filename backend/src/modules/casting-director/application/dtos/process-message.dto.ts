import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ProcessMessageDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content: string;
}