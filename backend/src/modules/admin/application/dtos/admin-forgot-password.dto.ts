import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from "class-validator";

export class AdminForgotPasswordDto {
    @IsEmail({}, { message: 'Provide a valid email address.' })
    @IsNotEmpty()
    email!: string;
}

export class AdminResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'Verification code is required.' })
    otp!: string;

    @IsString()
    @IsNotEmpty({ message: 'New password is required.' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
    @IsStrongPassword({}, { message: 'Password must contain uppercase, lowercase, numbers, and symbols.' })
    newPassword!: string;
}

export class AdminVerifyResetOtpDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'Verification code is required.' })
    otp!: string;
}