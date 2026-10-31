import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { PrivateListType } from "../../domain/enums/private-list.enums";

export class AddToPrivateListDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    targetUserId!: string;

    @IsEnum(PrivateListType)
    @IsNotEmpty()
    listType!: PrivateListType;
}