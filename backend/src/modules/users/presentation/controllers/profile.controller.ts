import { Body, Controller, HttpCode, HttpStatus, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/jwt-auth.guard";
import { IUpdatePersonaUseCase, UPDATE_PERSONA_USE_CASE } from "../../application/interfaces/update-persona.use-case.interface";
import { UpdatePersonaDto } from "../../application/dtos/update-persona.dto";
import { IUpdateLifestyleUseCase, UPDATE_LIFESTYLE_USE_CASE } from "../../application/interfaces/update-lifestyle.use-case.interface";
import { UpdateLifestyleDto } from "../../application/dtos/update-lifestyle.dto";

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController{
    constructor(
        @Inject(UPDATE_PERSONA_USE_CASE)
        private readonly updatePersonaUseCase: IUpdatePersonaUseCase,
        @Inject(UPDATE_LIFESTYLE_USE_CASE) 
        readonly updateLifestyleUseCase: IUpdateLifestyleUseCase,
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
}