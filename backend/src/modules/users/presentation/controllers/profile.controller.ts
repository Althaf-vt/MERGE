import { Body, Controller, HttpCode, HttpStatus, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/jwt-auth.guard";
import { IUpdatePersonaUseCase, UPDATE_PERSONA_USE_CASE } from "../../application/interfaces/update-persona.use-case.interface";
import { UpdatePersonaDto } from "../../application/dtos/update-persona.dto";

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController{
    constructor(
        @Inject(UPDATE_PERSONA_USE_CASE)
        private readonly updatePersonaUseCase: IUpdatePersonaUseCase,
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
}