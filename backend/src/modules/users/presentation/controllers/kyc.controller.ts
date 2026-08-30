import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from "@nestjs/common";
import { GetPresignedUrlUseCase } from "../../application/use-cases/get-presigned-urls.use-case";
import { SubmitKycDocumentUseCase } from "../../application/use-cases/submit-kyc-document.use-case";
import { GetPresignedUrlDto } from "../../application/dtos/get-presigned-url.dto";
import { SubmitKycDto } from "../../application/dtos/submit-kyc.dto";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/jwt-auth.guard";

@Controller('kyc')
@UseGuards(JwtAuthGuard) // Protects all endpoints below, requiring a valid access token
export class KycController{
    constructor(
        private readonly getPresignedUrlUseCase: GetPresignedUrlUseCase,
        private readonly submitKycDocumentUseCase: SubmitKycDocumentUseCase
    ){}

    @Get('presigned-url')
    @HttpCode(HttpStatus.OK)
    async getPresignedUrl(
        @Req() req: any, // req.user is automatically populated by the JwtAuthGuard
        @Query() query: GetPresignedUrlDto
    ){
        // Extract userId safely from the decoded JWT payload
        const userId = req.user.userId;

        return await this.getPresignedUrlUseCase.execute(userId, query.mimeType);
    }

    @Post('submit')
    @HttpCode(HttpStatus.OK)
    async submitkyc(
        @Req() req: any,
        @Body() dto: SubmitKycDto
    ){
        const userId = req.user.userId;

        // Executes the OCR extraction, hashing, duplicate check, and DB save
        return await this.submitKycDocumentUseCase.execute(userId, dto) 
    }
}