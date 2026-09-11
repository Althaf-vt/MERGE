import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";
import { DocumentType } from "../../domain/enums/user.enums";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { type IKycHashService, type IPkiVerificationService, KYC_HASH_SERVICE, PKI_VERIFICATION_SERVICE } from "../../domain/interfaces/kyc-service.interface";
import { UserKyc } from "../../domain/entities/kyc-verification.entity";
import { ISubmitKycDocumentUseCase, SubmitKycPayload } from "../interfaces/submit-kyc-document.use-case.interface";

@Injectable()
export class SubmitKycDocumentUseCase implements ISubmitKycDocumentUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(PKI_VERIFICATION_SERVICE) private readonly _pkiService: IPkiVerificationService,
        @Inject(KYC_HASH_SERVICE) private readonly _hashService: IKycHashService,
    ) { };

    async execute(userId: string, payload: SubmitKycPayload) {
        const user = await this._userRepository.findById(userId);

        let extractedData;

        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "User not found");

        // 1. Route to the correct cryptographic engine
        if (payload.documentType === DocumentType.AADHAAR_XML) {
            if (!payload.shareCode) throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, "Share code required for XML validation");
            extractedData = await this._pkiService.verifyAadhaarXml(payload.fileBuffer, payload.shareCode);
        } else {
            throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, 'Document type engine not yet implemented.');
        }

        // 2. Hash the extracted documnet number deterministically
        const hashedDocumentNumber = this._hashService.hashDocumentNumber(extractedData.documentNumber, payload.issuingCountry);

        // 3. Prevent duplicate accounts/ban evasions
        const existingKyc = await this._userRepository.findByDocumentHash(hashedDocumentNumber);
        if (existingKyc && existingKyc.userId !== userId) {
            throw new DomainException(ErrorCode.USER_ALREADY_EXISTS, "This government ID is already registered to another account.");
        }

        // 4. Initialize ot update the UserKyc entity
        const kycEntity = user.kycVerification || new UserKyc({ userId });

        kycEntity.recordPkiValidation({
            documentType: payload.documentType,
            issuingCountry: payload.issuingCountry,
            legalName: extractedData.legalName,
            verifiedDOB: extractedData.dateOfBirth,
            hashedDocumentNumber,
        })

        user.updateKycVerification(kycEntity);
        await this._userRepository.update(user);

        return {
            message: "Cryptographic validation successful",
            extractedData: {
                legalName: extractedData.legalName,
                dateOfBirth: extractedData.dateOfBirth,
            }
        };
    }
}