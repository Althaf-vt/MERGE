import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches, Max, Min, ValidateNested } from 'class-validator';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { BILLING_CATALOG_LIMITS } from '../../domain/constants/billing.constants';
import { BillingPeriod, Currency, SubscriptionEntitlement } from '../../domain/enums/billing.enums';
import { BILLING_NAME_REGEX } from '../../domain/utils/billing-normalization.util';

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
    @IsNotEmpty({ message: BILLING_ERROR_MESSAGES.PLAN_NAME_REQUIRED })
    @Length(BILLING_CATALOG_LIMITS.PLAN_NAME_MIN_LENGTH, BILLING_CATALOG_LIMITS.PLAN_NAME_MAX_LENGTH, {
        message: `Plan name must be between ${BILLING_CATALOG_LIMITS.PLAN_NAME_MIN_LENGTH} and ${BILLING_CATALOG_LIMITS.PLAN_NAME_MAX_LENGTH} characters.`,
    })
    @Matches(BILLING_NAME_REGEX, {
        message: BILLING_ERROR_MESSAGES.INVALID_PLAN_NAME_FORMAT,
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name!: string;

    @IsOptional()
    @IsString()
    @Length(BILLING_CATALOG_LIMITS.PLAN_CODE_MIN_LENGTH, BILLING_CATALOG_LIMITS.PLAN_CODE_MAX_LENGTH, {
        message: `Plan code must be between ${BILLING_CATALOG_LIMITS.PLAN_CODE_MIN_LENGTH} and ${BILLING_CATALOG_LIMITS.PLAN_CODE_MAX_LENGTH} characters.`,
    })
    @Matches(/^[A-Z0-9_]+$/, {
        message: 'Plan code must consist of uppercase letters, numbers, and underscores.',
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    code?: string;

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
    @Length(BILLING_CATALOG_LIMITS.PLAN_NAME_MIN_LENGTH, BILLING_CATALOG_LIMITS.PLAN_NAME_MAX_LENGTH, {
        message: `Plan name must be between ${BILLING_CATALOG_LIMITS.PLAN_NAME_MIN_LENGTH} and ${BILLING_CATALOG_LIMITS.PLAN_NAME_MAX_LENGTH} characters.`,
    })
    @Matches(BILLING_NAME_REGEX, {
        message: BILLING_ERROR_MESSAGES.INVALID_PLAN_NAME_FORMAT,
    })
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
