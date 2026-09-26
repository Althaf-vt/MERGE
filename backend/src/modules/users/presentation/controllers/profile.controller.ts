import { BadRequestException, Body, Controller, Delete, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { IUpdatePersonaUseCase, UPDATE_PERSONA_USE_CASE } from "../../application/interfaces/update-persona.use-case.interface";
import { UpdatePersonaDto } from "../../application/dtos/update-persona.dto";
import { IUpdateLifestyleUseCase, UPDATE_LIFESTYLE_USE_CASE } from "../../application/interfaces/update-lifestyle.use-case.interface";
import { UpdateLifestyleDto } from "../../application/dtos/update-lifestyle.dto";
import { UpdatePreferencesDto } from "../../application/dtos/update-preferences.dto";
import { IUpdatePreferencesUseCase, UPDATE_PREFERENCES_USE_CASE } from "../../application/interfaces/update-preferences.use-case.interface";
import { GenerateBioDto } from "../../application/dtos/generate-bio.dto";
import { GENERATE_BIO_USE_CASE, IGenerateBioUseCase } from "../../application/interfaces/generate-bio.use-case.interface";
import { ISaveBioUseCase, SAVE_BIO_USE_CASE } from "../../application/interfaces/save-bio.use-case.interface";
import { SaveBioDto } from "../../application/dtos/save-bio.dto";
import { IRemoveProfilePhotoUseCase, ISetPrimaryPhotoUseCase, IUpdateMedicalRecordUseCase, IUpdatePrivacySettingsUseCase, IUploadProfilePhotoUseCase, REMOVE_PROFILE_PHOTO_USE_CASE, SET_PRIMARY_PHOTO_USE_CASE, UPDATE_MEDICAL_RECORD_USE_CASE, UPDATE_PRIVACY_SETTINGS_USE_CASE, UPLOAD_PROFILE_PHOTO_USE_CASE } from "../../application/interfaces/profile-management.use-case.interface";
import { SetPrimaryPhotoDto, UpdateMedicalRecordDto, UpdatePrivacySettingsDto } from "../../application/dtos/profile-management.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { IUpdateFullProfileUseCase, UPDATE_FULL_PROFILE_USE_CASE } from "../../application/interfaces/update-full-profile.use-case.interface";
import { UpdateFullProfileDto } from "../../application/dtos/update-full-profile.dto";

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController{
    constructor(
        @Inject(UPDATE_PERSONA_USE_CASE) private readonly _updatePersonaUseCase: IUpdatePersonaUseCase,
        @Inject(UPDATE_LIFESTYLE_USE_CASE) private readonly _updateLifestyleUseCase: IUpdateLifestyleUseCase,
        @Inject(UPDATE_PREFERENCES_USE_CASE) private readonly _updatePreferencesUseCase: IUpdatePreferencesUseCase,
        @Inject(GENERATE_BIO_USE_CASE) private readonly _generateBioUseCase: IGenerateBioUseCase,
        @Inject(SAVE_BIO_USE_CASE) private readonly _saveBioUseCase: ISaveBioUseCase,
        @Inject(UPDATE_MEDICAL_RECORD_USE_CASE) private readonly _updateMedicalRecordUseCase: IUpdateMedicalRecordUseCase,
        @Inject(UPDATE_PRIVACY_SETTINGS_USE_CASE) private readonly _updatePrivacySettingsUseCase: IUpdatePrivacySettingsUseCase,
        @Inject(UPLOAD_PROFILE_PHOTO_USE_CASE) private readonly _uploadProfilePhotoUseCase: IUploadProfilePhotoUseCase,
        @Inject(SET_PRIMARY_PHOTO_USE_CASE) private readonly _setPrimaryPhotoUseCase: ISetPrimaryPhotoUseCase,
        @Inject(REMOVE_PROFILE_PHOTO_USE_CASE) private readonly _removeProfilePhotoUseCase: IRemoveProfilePhotoUseCase,
        @Inject(UPDATE_FULL_PROFILE_USE_CASE) private readonly _updateFullProfileUseCase: IUpdateFullProfileUseCase,
    ){}

    @Patch('persona')
    @HttpCode(HttpStatus.OK)
    async updatePersona(
        @Req() req: any,
        @Body() dto: UpdatePersonaDto
    ){
        const userId = req.user.userId;
        return await this._updatePersonaUseCase.execute(userId, dto)
    }

    @Patch('lifestyle')
    @HttpCode(HttpStatus.OK)
    async updateLifestyle(
        @Req() req: any,
        @Body() dto: UpdateLifestyleDto
    ){
        const userId = req.user.userId;
        return await this._updateLifestyleUseCase.execute(userId, dto)
    }

    @Patch('preferences')
    @HttpCode(HttpStatus.OK)
    async updatePreferences(
        @Req() req: any,
        @Body() dto: UpdatePreferencesDto
    ){
        const userId = req.user.userId;
        return await this._updatePreferencesUseCase.execute(userId, dto)
    }

    @Post('bio/generate')
    @HttpCode(HttpStatus.OK)
    async generateBio(
        @Req() req: any,
        @Body() dto: GenerateBioDto
    ){
        const userId = req.user.userId;
        return await this._generateBioUseCase.execute(userId, dto);
    }

    @Patch('bio/save')
    @HttpCode(HttpStatus.OK)
    async saveFinalBio(
        @Req() req: any,
        @Body() dto: SaveBioDto
    ){
        const userId = req.user.userId;
        return await this._saveBioUseCase.execute(userId, dto);
    }

    @Patch('full')
    @HttpCode(HttpStatus.OK)
    async updateFullProfile(@Req() req: any, @Body() dto: UpdateFullProfileDto) {
        const userId = req.user.userId;
        await this._updateFullProfileUseCase.execute(userId, dto);
        return { success: true, message: 'Profile updated successfully.' };
    }

    @Patch('medical')
    @HttpCode(HttpStatus.OK)
    async updateMedicalRecord(@Req() req: any, @Body() dto: UpdateMedicalRecordDto){
        const userId = req.user.userId;
        await this._updateMedicalRecordUseCase.execute(userId, dto);
        return {success: true, message: 'Medical records updated successfully.'};
    }

    @Patch('privacy')
    @HttpCode(HttpStatus.OK)
    async updatePrivacySettings(@Req() req: any, @Body() dto: UpdatePrivacySettingsDto) {
        const userId = req.user.userId;
        await this._updatePrivacySettingsUseCase.execute(userId, dto);
        return { success: true, message: 'Privacy settings updated successfully.' };
    }

    @Post('photos')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('photo', {
        limits: {fileSize: 5 * 1024 * 1024},
        fileFilter(req, file, callback){
            const allowedMimeType = ['image/jpeg', 'image/png', 'image/webp'];
            if(!allowedMimeType.includes(file.mimetype)){
                return callback(
                    new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'),
                    false
                );
            }
            callback(null, true)
        },
    }))
    async uploadProfilePhoto(@Req() req: any, @UploadedFile() file: Express.Multer.File){
        if(!file) throw new BadRequestException('Profile photo file is required.');
        const userId = req.user.userId; 

        await this._uploadProfilePhotoUseCase.execute(userId, file.buffer, file.mimetype);
        return {success: true, message: 'Photo uploaded and verification initiated'};
    }

    @Patch('photos/primary')
    @HttpCode(HttpStatus.OK)
    async setPrimaryPhoto(@Req() req: any, @Body() dto: SetPrimaryPhotoDto) {
        const userId = req.user.userId;
        await this._setPrimaryPhotoUseCase.execute(userId, dto);
        return { success: true, message: 'Primary photo updated successfully.' };
    }

    @Delete('photos/:photoId')
    @HttpCode(HttpStatus.OK)
    async removeProfilePhoto(@Req() req: any, @Param('photoId') photoId: string) {
        const userId = req.user.userId;
        await this._removeProfilePhotoUseCase.execute(userId, photoId);
        return { success: true, message: 'Photo removed successfully.' };
    }
}