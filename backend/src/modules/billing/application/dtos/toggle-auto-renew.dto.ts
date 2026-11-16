import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleAutoRenewDto {
    @IsBoolean()
    @IsNotEmpty()
    autoRenew!: boolean;
}
