import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelSubscriptionDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    reason?: string;
}
