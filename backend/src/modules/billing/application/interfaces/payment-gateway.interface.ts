import { Currency, PaymentEnvironment } from '../../domain/enums/billing.enums';

export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

export interface CreatePaymentOrderParams {
    amount: number;
    currency: Currency;
    receipt: string;
    notes?: Record<string, string>;
}

export interface PaymentOrderResult {
    orderId: string;
    amount: number;
    currency: Currency;
    keyId: string;
}

export interface VerifyPaymentSignatureParams {
    orderId: string;
    paymentId: string;
    signature: string;
}

export interface IPaymentGateway {
    readonly environment: PaymentEnvironment;
    createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>;
    verifyPaymentSignature(params: VerifyPaymentSignatureParams): boolean;
}
