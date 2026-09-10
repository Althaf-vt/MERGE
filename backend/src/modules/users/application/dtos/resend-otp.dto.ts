import { IsEmail, IsNotEmpty } from "class-validator";

export class ResendOtpDto {
    @IsEmail({}, { message: 'Provide a valid email address.' })
    @IsNotEmpty()
    email!: string;
}