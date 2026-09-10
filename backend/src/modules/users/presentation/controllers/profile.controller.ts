import { Body, Controller, HttpCode, HttpStatus, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/jwt-auth.guard";
import { IUpdatePersonaUseCase, UPDATE_PERSONA_USE_CASE } from "../../application/interfaces/update-persona.use-case.interface";
import { UpdatePersonaDto } from "../../application/dtos/update-persona.dto";
import { IUpdateLifestyleUseCase, UPDATE_LIFESTYLE_USE_CASE } from "../../application/interfaces/update-lifestyle.use-case.interface";
import { UpdateLifestyleDto } from "../../application/dtos/update-lifestyle.dto";
import { UpdatePreferencesDto } from "../../application/dtos/update-preferences.dto";
import { IUpdatePreferencesUseCase, UPDATE_PREFERENCES_USE_CASE } from "../../application/interfaces/update-preferences.use-case.interface";

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController{
    constructor(
        @Inject(UPDATE_PERSONA_USE_CASE)
        private readonly updatePersonaUseCase: IUpdatePersonaUseCase,
        @Inject(UPDATE_LIFESTYLE_USE_CASE) 
        private readonly updateLifestyleUseCase: IUpdateLifestyleUseCase,
        @Inject(UPDATE_PREFERENCES_USE_CASE)
        private readonly updatePreferencesUseCase: IUpdatePreferencesUseCase,
    ){}

    @Patch('persona')
    @HttpCode(HttpStatus.OK)
    async updatePersona(
        @Req() req: any,
        @Body() dto: UpdatePersonaDto
    ){
        const userId = req.user.userId;
        return await this.updatePersonaUseCase.execute(userId, dto)
    }

    @Patch('lifestyle')
    @HttpCode(HttpStatus.OK)
    async updateLifestyle(
        @Req() req: any,
        @Body() dto: UpdateLifestyleDto
    ){
        const userId = req.user.userId;
        return await this.updateLifestyleUseCase.execute(userId, dto)
    }

    @Patch('preferences')
    @HttpCode(HttpStatus.OK)
    async updatePreferences(
        @Req() req: any,
        @Body() dto: UpdatePreferencesDto
    ){
        const userId = req.user.userId;
        return await this.updatePreferencesUseCase.execute(userId, dto)
    }
}