import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import { DocumentType, VerificationDevice } from "../../domain/enums/user.enums";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { type IKycHashService, type IPkiVerificationService, KYC_HASH_SERVICE, OCR_SERVICE, PKI_VERIFICATION_SERVICE } from "../../domain/interfaces/kyc-service.interface";
import { UserKyc } from "../../domain/entities/kyc-verification.entity";

export interface SubmitKycDto{
    documentType: DocumentType;
    issuingCountry: string;
    fileBuffer: Buffer;
    shareCode?: string;
}

@Injectable()
export class SubmitKycDocumentUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(PKI_VERIFICATION_SERVICE) private readonly pkiService: IPkiVerificationService,
        @Inject(KYC_HASH_SERVICE) private readonly hashService: IKycHashService
    ){}

    async execute(userId: string, dto: SubmitKycDto){
        const user = await this.userRepository.findById(userId);

        let extractedData;

        if(!user) throw new BadRequestException("User not found");

        // 1. Route to the correct cryptographic engine
        if(dto.documentType === DocumentType.AADHAAR_XML){
            if(!dto.shareCode) throw new BadRequestException("Share code required for XML validation");
            extractedData = await this.pkiService.verifyAadhaarXml(dto.fileBuffer, dto.shareCode);
        }else{
            throw new BadRequestException('Document type engine yet implemented.')
        }

        // 2. Hash the extracted documnet number deterministically
        const hashedDocumentNumber = this.hashService.hashDocumentNumber(extractedData.documentNumber, dto.issuingCountry);

        // 3. Prevent duplicate accounts/ban evasions
        const existingKyc = await this.userRepository.findByDocumentHash(hashedDocumentNumber);
        if(existingKyc && existingKyc.userId !== userId){
            throw new ConflictException("This government ID is already registered to another account.");
        }

        // 4. Initialize ot update the UserKyc entity
        const kycEntity = user.kycVerfication || new UserKyc({userId});

        kycEntity.recordPkiValidation({
            documentType: dto.documentType,
            issuingCountry: dto.issuingCountry,
            legalName: extractedData.legalName,
            verifiedDOB: extractedData.dateOfBirth,
            hashedDocumentNumber,
        })

        user.updateKycVerification(kycEntity);
        await this.userRepository.update(user);

        return {
            message: "Cryptographic validation successful",
            extractedData: {
                legalName: extractedData.legalName,
                dateOfBirth: extractedData.dateOfBirth
            }
        }
    }
}