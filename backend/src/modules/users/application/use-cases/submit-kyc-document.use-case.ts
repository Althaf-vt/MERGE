import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import { DocumentType, VerificationDevice } from "../../domain/enums/user.enums";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { type IKycHashService, type IOcrService, KYC_HASH_SERVICE, OCR_SERVICE } from "../../domain/interfaces/kyc-service.interface";
import { UserKyc } from "../../domain/entities/kyc-verification.entity";

export interface SubmitKycDto{
    documentType: DocumentType;
    issuingCountry: string;
    documentFrontKey: string;
    documentBackKey?: string;
}

@Injectable()
export class SubmitKycDocumentUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(OCR_SERVICE) private readonly ocrService: IOcrService,
        @Inject(KYC_HASH_SERVICE) private readonly hashService: IKycHashService
    ){}

    async execute(userId: string, dto: SubmitKycDto){
        const user = await this.userRepository.findById(userId);

        if(!user) throw new BadRequestException("User not found");

        // 1. Run OCR extraction on the S3 files
        const extractedData = await this.ocrService.extractDocumentData(dto.documentFrontKey, dto.documentBackKey);

        if(extractedData.confidenceScore < 85){
            throw new BadRequestException('Document image quality too low. Please retake the photo clearly.');
        }

        // 2. Hash the extracted document number deterministically
        const hashedDocumentNumber = this.hashService.hashDocumentNumber(extractedData.documentNumber, dto.issuingCountry);

        // 3.Prevent duplicate accounts/ban evasions
        const existingKyc = await this.userRepository.findByDocumentHash(hashedDocumentNumber);
        if(existingKyc && existingKyc.id !== userId){
            throw new ConflictException('This government ID is already registered to another account.');
        }

        // 4. Initialize or update the UserKyc entity
        const kycEntity = user.kycVerfication || new UserKyc({userId});

        kycEntity.submitDocuments({
            documentType: dto.documentType,
            issuingCountry: dto.issuingCountry,
            documentFrontS3: dto.documentFrontKey,
            documentBackS3: dto.documentBackKey || '',
            verificationDevice: VerificationDevice.CURRENT_DEVICE,
            qrSessionId: '' // To be handled in mobile handoff logic later
        })

        // 5. Save extracted OCR data (looks in their legal name and DOB)
        kycEntity.recordOcrResult({
            legalName: extractedData.legalName,
            verifiedDOB: extractedData.dateOfBirth,
            hashedDocumentNumber,
            ocrConfidence: extractedData.confidenceScore
        })

        user.updateKycVerification(kycEntity);
        await this.userRepository.update(user);

        // We return the extracted data so the frontend can display it to the user 
        return {
            message: "Documents submitted successfully",
            extractedData: {
                legalName: extractedData.legalName,
                dateOfBirth: extractedData.dateOfBirth,
            }
        }
    }
}