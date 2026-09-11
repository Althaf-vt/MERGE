import { Body, Controller, HttpCode, HttpStatus, Inject, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/jwt-auth.guard";
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

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController{
    constructor(
        @Inject(UPDATE_PERSONA_USE_CASE)
        private readonly _updatePersonaUseCase: IUpdatePersonaUseCase,
        @Inject(UPDATE_LIFESTYLE_USE_CASE) 
        private readonly _updateLifestyleUseCase: IUpdateLifestyleUseCase,
        @Inject(UPDATE_PREFERENCES_USE_CASE)
        private readonly _updatePreferencesUseCase: IUpdatePreferencesUseCase,
        @Inject(GENERATE_BIO_USE_CASE)
        private readonly _generateBioUseCase: IGenerateBioUseCase,
        @Inject(SAVE_BIO_USE_CASE)
        private readonly _saveBioUseCase: ISaveBioUseCase
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
}