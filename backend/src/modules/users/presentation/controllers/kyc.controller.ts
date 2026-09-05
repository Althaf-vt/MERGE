import { BadRequestException, Body, Controller, FileTypeValidator, HttpCode, HttpStatus, MaxFileSizeValidator, ParseFilePipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { SubmitKycDocumentUseCase } from "../../application/use-cases/submit-kyc-document.use-case";
import { SubmitKycDto } from "../../application/dtos/submit-kyc.dto";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import 'multer'
import { SubmitLiveSelfieUseCase } from "../../application/use-cases/submit-live-selfie.use-case";
import { ISubmitLivenessCheckUseCase } from "../../application/interfaces/submit-liveness-check.use-case.interface";

@Controller('kyc')
@UseGuards(JwtAuthGuard) // Protects all endpoints below, requiring a valid access token
export class KycController{
    constructor(
        private readonly submitKycDocumentUseCase: SubmitKycDocumentUseCase,
        private readonly submitLiveSelfieUseCase: SubmitLiveSelfieUseCase,
        private readonly submitLivenessCheckUseCase: ISubmitLivenessCheckUseCase,
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

    @Post('selfie')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('selfie', {
        limits: {fileSize: 5 * 1024 * 1024},
        fileFilter(req, file, callback) {
            const allowedMineTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if(!allowedMineTypes.includes(file.mimetype)){
                return callback(
                    new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'),
                    false
                );
            }
            callback(null, true)
        },
    }))
    async submitSelfie(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ){
        const userId = req.user.userId;

        if(!file){
            throw new BadRequestException("Live Selfie file is required.");
        }

        return await this.submitLiveSelfieUseCase.execute(userId, file.buffer)
    }

    @Post('liveness')
    @UseInterceptors(FileInterceptor('video', {
        limits: {
            fileSize: 10 * 1042 * 1024 // 10MB limit for a 3-5 second liveness clip
        },
        fileFilter(req, file, cb) {
            if(!file.mimetype.match(/^video\/(webm|mp4)$/)){
                return cb(new BadRequestException("Only webm and mp4 video formats are allowed!"), false);
            }
            cb(null, true);
        },
    }))
    async submitLiveness(
        @Req() req: any,
        @UploadedFile() file: Express.Multer.File
    ){
        if(!file){
            throw new BadRequestException("Liveness video payload is required.");
        }

        const userId = req.user.id; //Extract from JWT payload
        return await this.submitLivenessCheckUseCase.execute(userId, file.buffer);
    }
}