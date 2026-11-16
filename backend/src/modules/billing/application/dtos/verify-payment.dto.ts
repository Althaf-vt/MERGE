import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BillingItemType } from '../../domain/enums/billing.enums';

export class VerifyPaymentDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    orderId!: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    paymentId!: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    signature!: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    itemId!: string;

    @IsEnum(BillingItemType)
    @IsNotEmpty()
    itemType!: BillingItemType;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    promoCode?: string;
}
