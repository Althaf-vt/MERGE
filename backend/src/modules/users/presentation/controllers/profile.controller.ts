import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
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
import { GET_PROFILE_USE_CASE, IGetProfileUseCase, GetProfileDataResult } from "../../application/interfaces/get-profile.use-case.interface";
import { IUpdateFullPreferencesUseCase, UPDATE_FULL_PREFERENCES_USE_CASE } from "../../application/interfaces/update-full-preferences.use-case.interface";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { API_ENDPOINTS } from "../../../../shared/domain/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/domain/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/domain/constants/response-messages.constant";
import { UserProfileProps } from "../../domain/entities/user-profile.entity";
import { UserPreferenceProps } from "../../domain/entities/user-preference.entity";

@Controller(API_ENDPOINTS.PROFILE.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class ProfileController {
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
        @Inject(GET_PROFILE_USE_CASE) private readonly _getProfileUseCase: IGetProfileUseCase,
        @Inject(UPDATE_FULL_PREFERENCES_USE_CASE) private readonly _updateFullPreferencesUseCase: IUpdateFullPreferencesUseCase,
    ){}

    @Patch(API_ENDPOINTS.PROFILE.PERSONA)
    @HttpCode(HttpStatus.OK)
    async updatePersona(
        @Req() req: AuthenticatedRequest,
        @Body() dto: UpdatePersonaDto
    ): Promise<ApiResponse<{ profile: UserProfileProps; verifiedDOB?: Date }>> {
        const userId = req.user.userId;
        const result = await this._updatePersonaUseCase.execute(userId, dto);
        
        return {
            success: true,
            message: RESPONSE_MESSAGES.PROFILE.PERSONA_UPDATED,
            data: result
        };
    }

    @Patch(API_ENDPOINTS.PROFILE.LIFESTYLE)
    @HttpCode(HttpStatus.OK)
    async updateLifestyle(
        @Req() req: AuthenticatedRequest,
        @Body() dto: UpdateLifestyleDto
    ): Promise<ApiResponse<{ profile: UserProfileProps }>> {
        const userId = req.user.userId;
        const result = await this._updateLifestyleUseCase.execute(userId, dto);
        
        return {
            success: true,
            message: RESPONSE_MESSAGES.PROFILE.LIFESTYLE_UPDATED,
            data: { profile: result }
        };
    }

    @Patch(API_ENDPOINTS.PROFILE.PREFERENCES)
    @HttpCode(HttpStatus.OK)
    async updatePreferences(
        @Req() req: AuthenticatedRequest, 
        @Body() dto: UpdatePreferencesDto
    ): Promise<ApiResponse<{ preferences: UserPreferenceProps }>> {
        const userId = req.user.userId;
        const result = await this._updatePreferencesUseCase.execute(userId, dto);
        
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.PROFILE.PREFERENCES_UPDATED,
            data: { preferences: result }
        };
    }

    @Post(API_ENDPOINTS.PROFILE.BIO_GENERATE)
    @HttpCode(HttpStatus.OK)
    async generateBio(
        @Req() req: AuthenticatedRequest,
        @Body() dto: GenerateBioDto
    ): Promise<ApiResponse<{ bios: string[]; remainingAttempts: number }>> {
        const userId = req.user.userId;
        const result = await this._generateBioUseCase.execute(userId, dto);
        
        return {
            success: true,
            data: {
                bios: result.bios,
                remainingAttempts: result.remainingAttempts
            }
        };
    }

    @Patch(API_ENDPOINTS.PROFILE.BIO_SAVE)
    @HttpCode(HttpStatus.OK)
    async saveFinalBio(
        @Req() req: AuthenticatedRequest,
        @Body() dto: SaveBioDto
    ): Promise<ApiResponse<undefined>> {
        const userId = req.user.userId;
        await this._saveBioUseCase.execute(userId, dto);
        
        return {
            success: true,
            message: RESPONSE_MESSAGES.PROFILE.BIO_SAVED
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getProfile(@Req() req: AuthenticatedRequest): Promise<ApiResponse<GetProfileDataResult>> {
        const userId = req.user.userId;
        const profileData = await this._getProfileUseCase.execute(userId);

        return {
            success: true,
            data: profileData
        };
    }

    @Patch(API_ENDPOINTS.PROFILE.FULL)
    @HttpCode(HttpStatus.OK)
    async updateFullProfile(
        @Req() req: AuthenticatedRequest, 
        @Body() dto: UpdateFullProfileDto
    ): Promise<ApiResponse<undefined>> {
        const userId = req.user.userId;
        await this._updateFullProfileUseCase.execute(userId, dto);
        return { success: true, message: RESPONSE_MESSAGES.PROFILE.UPDATE_SUCCESS };
    }

    @Patch(API_ENDPOINTS.PROFILE.MEDICAL)
    @HttpCode(HttpStatus.OK)
    async updateMedicalRecord(
        @Req() req: AuthenticatedRequest, 
        @Body() dto: UpdateMedicalRecordDto
    ): Promise<ApiResponse<undefined>> {
        const userId = req.user.userId;
        await this._updateMedicalRecordUseCase.execute(userId, dto);
        return { success: true, message: RESPONSE_MESSAGES.PROFILE.MEDICAL_UPDATED };
    }

    @Patch(API_ENDPOINTS.PROFILE.PRIVACY)
    @HttpCode(HttpStatus.OK)
    async updatePrivacySettings(
        @Req() req: AuthenticatedRequest, 
        @Body() dto: UpdatePrivacySettingsDto
    ): Promise<ApiResponse<undefined>> {
        const userId = req.user.userId;
        await this._updatePrivacySettingsUseCase.execute(userId, dto);
        return { success: true, message: RESPONSE_MESSAGES.PROFILE.PRIVACY_UPDATED };
    }

    @Post(API_ENDPOINTS.PROFILE.PHOTOS)
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('photo', {
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter(req, file, callback) {
            const allowedMimeType = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedMimeType.includes(file.mimetype)) {
                return callback(
                    new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'),
                    false
                );
            }
            callback(null, true);
        },
    }))
    async uploadProfilePhoto(
        @Req() req: AuthenticatedRequest, 
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponse<undefined>> {
        if (!file) throw new BadRequestException('Profile photo file is required.');
        const userId = req.user.userId; 

        await this._uploadProfilePhotoUseCase.execute(userId, file.buffer, file.mimetype);
        return { success: true, message: RESPONSE_MESSAGES.PROFILE.PHOTO_UPLOADED };
    }

    @Patch(API_ENDPOINTS.PROFILE.PHOTOS_PRIMARY)
    @HttpCode(HttpStatus.OK)
    async setPrimaryPhoto(
        @Req() req: AuthenticatedRequest, 
        @Body() dto: SetPrimaryPhotoDto
    ): Promise<ApiResponse<undefined>> {
        const userId = req.user.userId;
        await this._setPrimaryPhotoUseCase.execute(userId, dto);
        return { success: true, message: RESPONSE_MESSAGES.PROFILE.PRIMARY_PHOTO_SET };
    }

    @Delete(API_ENDPOINTS.PROFILE.PHOTO_BY_ID)
    @HttpCode(HttpStatus.OK)
    async removeProfilePhoto(
        @Req() req: AuthenticatedRequest, 
        @Param('photoId') photoId: string
    ): Promise<ApiResponse<undefined>> {
        const userId = req.user.userId;
        await this._removeProfilePhotoUseCase.execute(userId, photoId);
        return { success: true, message: RESPONSE_MESSAGES.PROFILE.PHOTO_DELETED };
    }
}