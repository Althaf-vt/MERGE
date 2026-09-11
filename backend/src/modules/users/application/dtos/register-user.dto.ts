import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";
import { Match } from "../../../../shared/infrastructure/decorators/match.decorator";

// DTO for user registration that validates the email and password before processing.
export class RegisterUserDto{
    @IsEmail({}, {message: "A valid email is required"})
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
    @IsStrongPassword()
    password: string;

    @IsString()
    @IsNotEmpty()
    @Match('password',{message: "Passwords do not match"})
    confirmPassword: string
}