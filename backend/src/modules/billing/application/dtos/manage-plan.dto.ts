import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { BillingPeriod, Currency, SubscriptionEntitlement } from '../../domain/enums/billing.enums';

export class PlanPriceDto {
    @IsNumber()
    @Min(0)
    amount!: number;

    @IsEnum(Currency)
    @IsNotEmpty()
    currency!: Currency;
}

export class PlanOfferInputDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    id?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    code?: string;

    @IsNumber()
    @Min(1)
    @Max(100)
    discountPercentage!: number;

    @IsDate()
    @Type(() => Date)
    validFrom!: Date;

    @IsDate()
    @Type(() => Date)
    validUntil!: Date;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class CreateSubscriptionPlanDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name!: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    code!: string;

    @IsEnum(BillingPeriod)
    @IsNotEmpty()
    billingPeriod!: BillingPeriod;

    @ValidateNested()
    @Type(() => PlanPriceDto)
    price!: PlanPriceDto;

    @IsArray()
    @IsEnum(SubscriptionEntitlement, { each: true })
    entitlements!: SubscriptionEntitlement[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlanOfferInputDto)
    offers?: PlanOfferInputDto[];

    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateSubscriptionPlanDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PlanPriceDto)
    price?: PlanPriceDto;

    @IsOptional()
    @IsArray()
    @IsEnum(SubscriptionEntitlement, { each: true })
    entitlements?: SubscriptionEntitlement[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlanOfferInputDto)
    offers?: PlanOfferInputDto[];

    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
