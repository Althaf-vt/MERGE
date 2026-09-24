import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MaxLength } from "class-validator";
import { Match } from "../../../../shared/infrastructure/validation/match.decorator";

export class InviteAdminDto {
    @IsEmail({}, { message: 'Provide a valid email address.' })
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @IsString()
    @IsNotEmpty()
    role!: string;

    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}

export class AcceptAdminInviteDto {
    @IsString()
    @IsNotEmpty()
    token!: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required.' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters.' })
    @IsStrongPassword({}, { message: 'Password must meet strict security requirements.' })
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'Please confirm your password.' })
    @Match('password', { message: 'Passwords do not match.' })
    confirmPassword!: string;
}

export class UpdateAdminDto {
    @IsString()
    @IsOptional()
    role?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissions?: string[];
}