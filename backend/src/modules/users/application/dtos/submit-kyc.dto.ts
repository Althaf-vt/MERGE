import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { DocumentType, VerificationDevice } from "../../domain/enums/user.enums";

export class SubmitKycDto{
    @IsEnum(DocumentType, {message: "Invalid document type"})
    @IsNotEmpty()
    documentType: DocumentType;

    @IsString()
    @IsNotEmpty()
    issuingCountry: string;

    @IsString()
    @IsNotEmpty()
    documentFrontKey: string;

    @IsString()
    @IsOptional()
    documentBackKey?: string;
}