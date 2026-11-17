import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, Min, ValidateNested } from 'class-validator';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { BILLING_CATALOG_LIMITS } from '../../domain/constants/billing.constants';
import { BILLING_NAME_REGEX } from '../../domain/utils/billing-normalization.util';
import { PlanOfferInputDto, PlanPriceDto } from './manage-plan.dto';

export class CreateCreditPackDto {
    @IsString()
    @IsNotEmpty({ message: BILLING_ERROR_MESSAGES.CREDIT_PACK_NAME_REQUIRED })
    @Length(BILLING_CATALOG_LIMITS.CREDIT_PACK_NAME_MIN_LENGTH, BILLING_CATALOG_LIMITS.CREDIT_PACK_NAME_MAX_LENGTH, {
        message: `Credit pack name must be between ${BILLING_CATALOG_LIMITS.CREDIT_PACK_NAME_MIN_LENGTH} and ${BILLING_CATALOG_LIMITS.CREDIT_PACK_NAME_MAX_LENGTH} characters.`,
    })
    @Matches(BILLING_NAME_REGEX, {
        message: BILLING_ERROR_MESSAGES.INVALID_CREDIT_PACK_NAME_FORMAT,
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name!: string;

    @IsOptional()
    @IsString()
    @Length(BILLING_CATALOG_LIMITS.CREDIT_PACK_CODE_MIN_LENGTH, BILLING_CATALOG_LIMITS.CREDIT_PACK_CODE_MAX_LENGTH, {
        message: `Credit pack code must be between ${BILLING_CATALOG_LIMITS.CREDIT_PACK_CODE_MIN_LENGTH} and ${BILLING_CATALOG_LIMITS.CREDIT_PACK_CODE_MAX_LENGTH} characters.`,
    })
    @Matches(/^[A-Z0-9_]+$/, {
        message: 'Credit pack code must consist of uppercase letters, numbers, and underscores.',
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    code?: string;

    @IsInt()
    @Min(1)
    creditsCount!: number;

    @ValidateNested()
    @Type(() => PlanPriceDto)
    price!: PlanPriceDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlanOfferInputDto)
    offers?: PlanOfferInputDto[];

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    badge?: string;

    @IsOptional()
    @IsInt()
    sortOrder?: number;

    @IsOptional()
    @IsBoolean()
    isListed?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateCreditPackDto {
    @IsOptional()
    @IsString()
    @Length(BILLING_CATALOG_LIMITS.CREDIT_PACK_NAME_MIN_LENGTH, BILLING_CATALOG_LIMITS.CREDIT_PACK_NAME_MAX_LENGTH, {
        message: `Credit pack name must be between ${BILLING_CATALOG_LIMITS.CREDIT_PACK_NAME_MIN_LENGTH} and ${BILLING_CATALOG_LIMITS.CREDIT_PACK_NAME_MAX_LENGTH} characters.`,
    })
    @Matches(BILLING_NAME_REGEX, {
        message: BILLING_ERROR_MESSAGES.INVALID_CREDIT_PACK_NAME_FORMAT,
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    creditsCount?: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => PlanPriceDto)
    price?: PlanPriceDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlanOfferInputDto)
    offers?: PlanOfferInputDto[];

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    badge?: string;

    @IsOptional()
    @IsInt()
    sortOrder?: number;

    @IsOptional()
    @IsBoolean()
    isListed?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
