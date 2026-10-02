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

export class InitiateEmailChangeDto{
    @IsString()
    @IsNotEmpty({ message: 'Current email verification code is required.' })
    @MaxLength(6, { message: 'OTP must be exactly 6 digits.' })
    currentOtp!: string;

    @IsEmail({}, { message: 'Provide a valid new email address.' })
    @IsNotEmpty()
    @MaxLength(255, { message: 'Email cannot exceed 255 characters.' })
    newEmail!: string;
}

export class ConfirmEmailChangeDto {
    @IsString()
    @IsNotEmpty({ message: 'New email verification code is required.' })
    @MaxLength(6, { message: 'OTP must be exactly 6 digits.' })
    newEmailOtp!: string;
}