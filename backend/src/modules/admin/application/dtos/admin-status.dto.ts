import { IsString, IsNotEmpty, IsNumber, Min, IsIn } from 'class-validator';

export class SuspendAdminDto {
    @IsNumber()
    @Min(1)
    duration!: number;

    @IsString()
    @IsIn(['HOURS', 'DAYS'])
    unit!: string;

    @IsString()
    @IsNotEmpty()
    reason!: string;
}

export class AdminStatusReasonDto {
    @IsString()
    @IsNotEmpty()
    reason!: string;
}