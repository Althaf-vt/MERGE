import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AdminLoginDto {
    @IsEmail({}, {message: 'Provide a valid email address.'})
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty({message: 'Password is required'})
    password!: string;
}