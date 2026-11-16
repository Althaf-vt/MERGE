import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubscribePlanDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    planId!: string;

    @IsOptional()
    @IsBoolean()
    autoRenew?: boolean;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    paymentMethodRef?: string;
}
