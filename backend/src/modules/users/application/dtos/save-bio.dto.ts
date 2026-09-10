import { ArrayMaxSize, IsArray, IsNotEmpty, IsString } from "class-validator";

export class SaveBioDto{
    @IsNotEmpty()
    @IsString()
    bio: string;

    @IsArray()
    @ArrayMaxSize(5)
    @IsString({each: true})
    seletedTraits: string[];

    @IsArray()
    @ArrayMaxSize(5)
    @IsString({each: true})
    interests: string[];
}