import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { SubmitKycDto } from "../../application/dtos/submit-kyc.dto";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import 'multer';
import { ISubmitLivenessCheckUseCase, SUBMIT_LIVENESS_CHECK_USE_CASE, SubmitLivenessCheckResult } from "../../application/interfaces/submit-liveness-check.use-case.interface";
import { ISubmitFinalVerificationUseCase, SUBMIT_FINAL_VERIFICATION_USE_CASE, SubmitFinalVerificationResult } from "../../application/interfaces/submit-final-verification.use-case.interface";
import { ISubmitLiveSelfieUseCase, SUBMIT_LIVE_SELFIE_USE_CASE, SubmitLiveSelfieResult } from "../../application/interfaces/submit-live-selfie.use-case.interface";
import { ISubmitKycDocumentUseCase, SUBMIT_KYC_DOCUMENT_USE_CASE, SubmitKycDocumentResult } from "../../application/interfaces/submit-kyc-document.use-case.interface";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";
import { RequiredFile, UploadFile, UploadImage, UploadVideo } from "../../../../shared/presentation/decorators/file-upload.decorator";

@Controller(API_ENDPOINTS.KYC.BASE)
@UseGuards(JwtAuthGuard)
export class KycController {
    constructor(
        @Inject(SUBMIT_KYC_DOCUMENT_USE_CASE) private readonly _submitKycDocumentUseCase: ISubmitKycDocumentUseCase,
        @Inject(SUBMIT_LIVE_SELFIE_USE_CASE) private readonly _submitLiveSelfieUseCase: ISubmitLiveSelfieUseCase,
        @Inject(SUBMIT_LIVENESS_CHECK_USE_CASE) private readonly _submitLivenessCheckUseCase: ISubmitLivenessCheckUseCase,
        @Inject(SUBMIT_FINAL_VERIFICATION_USE_CASE) private readonly _submitFinalVerificationUseCase: ISubmitFinalVerificationUseCase,
    ) { }

    @Post(API_ENDPOINTS.KYC.SUBMIT)
    @HttpCode(HttpStatus.OK)
    @UploadFile('document')
    async submitkyc(
        @Req() req: AuthenticatedRequest,
        @Body() dto: SubmitKycDto,
        @RequiredFile('Digital signature file is required') file: Express.Multer.File
    ): Promise<ApiResponse<SubmitKycDocumentResult>> {
        const userId = req.user.userId;

        const data = await this._submitKycDocumentUseCase.execute(userId, {
            ...dto,
            fileBuffer: file.buffer,
        });

        return {
            success: true,
            message: RESPONSE_MESSAGES.KYC.DOCUMENT_VALIDATED,
            data
        };
    }

    @Post(API_ENDPOINTS.KYC.SELFIE)
    @HttpCode(HttpStatus.OK)
    @UploadImage('selfie')
    async submitSelfie(
        @RequiredFile('Live Selfie file is required.') file: Express.Multer.File,
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<SubmitLiveSelfieResult>> {
        const userId = req.user.userId;

        const data = await this._submitLiveSelfieUseCase.execute(userId, file.buffer);

        return {
            success: true,
            message: RESPONSE_MESSAGES.KYC.SELFIE_CAPTURED,
            data
        };
    }

    @Post(API_ENDPOINTS.KYC.LIVENESS)
    @HttpCode(HttpStatus.OK)
    @UploadVideo('video')
    async submitLiveness(
        @Req() req: AuthenticatedRequest,
        @Body('promptType') promptType: string,
        @RequiredFile('Liveness video payload is required.') file: Express.Multer.File
    ): Promise<ApiResponse<SubmitLivenessCheckResult>> {
        const userId = req.user.userId;
        const data = await this._submitLivenessCheckUseCase.execute(userId, promptType, file.buffer);

        return {
            success: true,
            message: RESPONSE_MESSAGES.KYC.LIVENESS_VERIFIED,
            data
        };
    }

    @Post(API_ENDPOINTS.KYC.SUBMIT_VERIFICATION)
    @HttpCode(HttpStatus.OK)
    async submitFinalVerification(@Req() req: AuthenticatedRequest): Promise<ApiResponse<SubmitFinalVerificationResult>> {
        const userId = req.user.userId;
        const data = await this._submitFinalVerificationUseCase.execute(userId);

        return {
            success: true,
            message: RESPONSE_MESSAGES.KYC.VERIFICATION_SUBMITTED,
            data
        };
    }
}
