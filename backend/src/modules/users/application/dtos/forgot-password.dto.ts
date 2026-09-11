import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from "class-validator";

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Provide a valid email address.' })
    @IsNotEmpty()
    email!: string;
}

export class ResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    otp!: string;

    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
    @IsStrongPassword()
    newPassword: string;
}