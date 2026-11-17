import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { PlanOfferInputDto, PlanPriceDto } from './manage-plan.dto';

export class CreateCreditPackDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name!: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    code!: string;

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
