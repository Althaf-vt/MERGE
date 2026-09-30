import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { Match } from '../../../../shared/infrastructure/validation/match.decorator';

export class UpdateSecurityPasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'OTP verification code is required.' })
    otp!: string;

    @IsString()
    @IsNotEmpty({ message: 'New password is required.' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters.' })
    @IsStrongPassword({}, { message: 'Password must contain uppercase, lowercase, numbers, and symbols.' })
    newPassword!: string;

    @IsString()
    @IsNotEmpty({ message: 'Please confirm your new password.' })
    @Match('newPassword', { message: 'Passwords do not match.' })
    confirmPassword!: string;
}

export class UpdateSecurityEmailDto {
    @IsEmail({}, { message: 'Provide a valid email address.' })
    @IsNotEmpty()
    newEmail!: string;

    @IsString()
    @IsNotEmpty({ message: 'OTP verification code is required.' })
    otp!: string;
}

export class RevokeSessionDto {
    @IsString()
    @IsNotEmpty()
    sessionId!: string;
}