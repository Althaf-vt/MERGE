import { BillingItemType } from '../../domain/enums/billing.enums';

export interface PaymentVerificationResponseDto {
    success: boolean;
    referenceId: string;
    transactionId: string;
    itemType: BillingItemType;
    message: string;
}
