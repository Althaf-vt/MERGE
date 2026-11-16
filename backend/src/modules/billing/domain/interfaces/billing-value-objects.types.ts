import { BillingPeriod, Currency } from '../enums/billing.enums';

export interface MoneyProps {
    amount: number;
    currency: Currency;
}

export interface PlanBillingPeriodProps {
    period: BillingPeriod;
}

export interface PlanOfferProps {
    code: string;
    discountPercentage: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
}
