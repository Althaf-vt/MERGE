import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// DTO for validating user login credentials before authentication.
export class LoginUserDto{
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsNotEmpty()
    @IsString()
    password: string
}