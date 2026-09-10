import { ArrayMaxSize, IsArray, IsNotEmpty, IsString } from "class-validator";

export class SaveBioDto{
    @IsNotEmpty()
    @IsString()
    bio: string;

    @IsArray()
    @ArrayMaxSize(5)
    @IsString({each: true})
    selectedTraits: string[];

    @IsArray()
    @ArrayMaxSize(5)
    @IsString({each: true})
    interests: string[];
}