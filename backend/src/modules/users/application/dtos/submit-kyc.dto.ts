import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { DocumentType, LivenessPrompt } from "../../domain/enums/user.enums";

export class SubmitKycDto {
    @IsEnum(DocumentType, { message: "Invalid document type" })
    @IsNotEmpty()
    documentType: DocumentType;

    @IsString()
    @IsNotEmpty()
    issuingCountry: string;

    @IsString()
    @IsOptional()
    shareCode?: string;
}

export class SubmitLivenessCheckDto {
    @IsEnum(LivenessPrompt, { message: "Invalid liveness prompt type" })
    @IsNotEmpty({ message: "Liveness prompt type is required" })
    promptType: LivenessPrompt;
}
