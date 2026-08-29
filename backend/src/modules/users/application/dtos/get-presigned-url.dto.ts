import { IsNotEmpty, IsString } from "class-validator";

export class GetPresignedUrlDto{
    @IsNotEmpty()
    @IsString()
    mimeType: string;
}