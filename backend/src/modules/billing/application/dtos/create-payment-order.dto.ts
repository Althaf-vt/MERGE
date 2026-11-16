import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BillingItemType } from '../../domain/enums/billing.enums';

export class CreatePaymentOrderDto {
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
