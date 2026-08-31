import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { SubmitKycDocumentUseCase } from "../../application/use-cases/submit-kyc-document.use-case";
import { SubmitKycDto } from "../../application/dtos/submit-kyc.dto";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import 'multer'

@Controller('kyc')
@UseGuards(JwtAuthGuard) // Protects all endpoints below, requiring a valid access token
export class KycController{
    constructor(
        private readonly submitKycDocumentUseCase: SubmitKycDocumentUseCase
    ){}

    @Post('submit')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('document')) // Multer intercepts the 'document' form-data field
    async submitkyc(
        @Req() req: any,
        @Body() dto: SubmitKycDto,
        @UploadedFile() file: Express.Multer.File
    ){
        const userId = req.user.userId;

        if(!file){
            throw new BadRequestException("Digital signature file is requrired");
        }

        // Executes the OCR extraction, hashing, duplicate check, and DB save
        return await this.submitKycDocumentUseCase.execute(userId, {
            ...dto,
            fileBuffer: file.buffer,
        }) 
    }
}