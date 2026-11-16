import { BillingItemType, Currency } from '../../domain/enums/billing.enums';

export interface PaymentOrderResponseDto {
    orderId: string;
    amount: number;
    currency: Currency;
    keyId: string;
    itemName: string;
    itemType: BillingItemType;
    receipt: string;
}
