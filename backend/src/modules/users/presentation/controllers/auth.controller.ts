import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case";
import { VerifyOtpUseCase } from "../../application/use-cases/verify-otp.use-case";
import { RegisterUserDto } from "../../application/dtos/register-user.dto";
import { UserResponseMapper } from "../mappers/user-response.mapper";
import { VerifyOtpDto } from "../../application/dtos/verify-otp.dto";

// Handles authentication-related HTTP requests such as registration and OTP verfication.
@Controller('auth')
export class AuthController{

    // Injects the use-cases responsible for registration and OTP verification.
    constructor(
        private  readonly registerUserUserCase: RegisterUserUseCase,
        private readonly verifyOtpUseCase: VerifyOtpUseCase,

        // Inject login and forgot pass use cases here later....
    ){}

    // Handles user registration requests. 
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterUserDto){
        await this.registerUserUserCase.execute(dto);

        return{
            message: "Registration started. Please check you mail for the OTP"
        }
    }

    // Handles OTP verification requests.
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() dto: VerifyOtpDto){
        const user = await this.verifyOtpUseCase.execute(dto);

        return {
            message: "Email verified successfully",
            user: UserResponseMapper.toResponse(user),
        }
    }
}