import { ArrayMaxSize, IsArray, IsString } from "class-validator";

export class GenerateBioDto{
    @IsArray()
    @ArrayMaxSize(5)
    @IsString({each: true})
    selectedTraits!: string[];

    @IsArray()
    @ArrayMaxSize(5)
    @IsString({each: true})
    interests!: string[];
}