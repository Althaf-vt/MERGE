import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Res } from "@nestjs/common";
import { ADMIN_LOGIN_USE_CASE, IAdminLoginUseCase } from "../../application/interfaces/admin-login.use-case.interface";
import { AdminLoginDto } from "../../application/dtos/admin-login.dto";
import { Response } from "express";
import { AdminResponseMapper } from "../mappers/admin-response.mapper";


@Controller()
export class AdminAuthController {
    constructor(
        @Inject(ADMIN_LOGIN_USE_CASE)
        private readonly adminLoginUseCase: IAdminLoginUseCase,
    ){}

    @Post()
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: AdminLoginDto, @Res({passthrough: true}) res: Response) {
        const result = await this.adminLoginUseCase.execute(dto);

        res.cookie('adminRefreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return {
            message: "Admin login successful",
            accessToken: result.accessToken,
            admin: AdminResponseMapper.toResponse(result.admin)
        };
    }
}