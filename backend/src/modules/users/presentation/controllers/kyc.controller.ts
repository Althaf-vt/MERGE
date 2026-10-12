import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { SubmitKycDto } from "../../application/dtos/submit-kyc.dto";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import 'multer';
import { ISubmitLivenessCheckUseCase, SUBMIT_LIVENESS_CHECK_USE_CASE, SubmitLivenessCheckResult } from "../../application/interfaces/submit-liveness-check.use-case.interface";
import { ISubmitFinalVerificationUseCase, SUBMIT_FINAL_VERIFICATION_USE_CASE, SubmitFinalVerificationResult } from "../../application/interfaces/submit-final-verification.use-case.interface";
import { ISubmitLiveSelfieUseCase, SUBMIT_LIVE_SELFIE_USE_CASE, SubmitLiveSelfieResult } from "../../application/interfaces/submit-live-selfie.use-case.interface";
import { ISubmitKycDocumentUseCase, SUBMIT_KYC_DOCUMENT_USE_CASE, SubmitKycDocumentResult } from "../../application/interfaces/submit-kyc-document.use-case.interface";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { API_ENDPOINTS } from "../../../../shared/domain/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/domain/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/domain/constants/response-messages.constant";

@Controller(API_ENDPOINTS.KYC.BASE)
@UseGuards(JwtAuthGuard)
export class KycController {
    constructor(
        @Inject(SUBMIT_KYC_DOCUMENT_USE_CASE) private readonly _submitKycDocumentUseCase: ISubmitKycDocumentUseCase,
        @Inject(SUBMIT_LIVE_SELFIE_USE_CASE) private readonly _submitLiveSelfieUseCase: ISubmitLiveSelfieUseCase,
        @Inject(SUBMIT_LIVENESS_CHECK_USE_CASE) private readonly _submitLivenessCheckUseCase: ISubmitLivenessCheckUseCase,
        @Inject(SUBMIT_FINAL_VERIFICATION_USE_CASE) private readonly _submitFinalVerificationUseCase: ISubmitFinalVerificationUseCase,
    ){}

    @Post(API_ENDPOINTS.KYC.SUBMIT)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('document'))
    async submitkyc(
        @Req() req: AuthenticatedRequest,
        @Body() dto: SubmitKycDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponse<SubmitKycDocumentResult>> {
        const userId = req.user.userId;

        if(!file){
            throw new BadRequestException("Digital signature file is required");
        }

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
    @UseInterceptors(FileInterceptor('selfie', {
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter(_req, file, callback) {
            const allowedMineTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if(!allowedMineTypes.includes(file.mimetype)){
                return callback(new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
            }
            callback(null, true);
        },
    }))
    @HttpCode(HttpStatus.OK)
    async submitSelfie(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<SubmitLiveSelfieResult>> {
        const userId = req.user.userId;

        if(!file){
            throw new BadRequestException("Live Selfie file is required.");
        }

        const data = await this._submitLiveSelfieUseCase.execute(userId, file.buffer);
        
        return {
            success: true,
            message: RESPONSE_MESSAGES.KYC.SELFIE_CAPTURED,
            data
        };
    }

    @Post(API_ENDPOINTS.KYC.LIVENESS)
    @UseInterceptors(FileInterceptor('video', {
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter(req, file, cb) {
            const allowedMimeTypes = ['video/webm', 'video/mp4', 'video/quicktime', 'application/octet-stream'];
            const isExtensionAllowed = /\.(mp4|webm)$/i.test(file.originalname);
            const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
            
            if (!isExtensionAllowed && !isMimeAllowed) {
                return cb(new BadRequestException("Only webm and mp4 video formats are allowed!"), false);
            }
            cb(null, true);
        },
    }))
    @HttpCode(HttpStatus.OK)
    async submitLiveness(
        @Req() req: AuthenticatedRequest,
        @Body('promptType') promptType: string,
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponse<SubmitLivenessCheckResult>> {
        if(!file){
            throw new BadRequestException("Liveness video payload is required.");
        }

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