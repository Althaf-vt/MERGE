import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

// DTO for user registration that validates the email and password before processing.
export class RegisterUserDto{
    @IsEmail({}, {message: "A valid email is required"})
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, {message: "Password must be at least 8 character long"})
    password: string
}