import { BillingTransactionType, PaymentEnvironment, TransactionStatus } from '../enums/billing.enums';
import { MoneyProps } from './billing-value-objects.types';

export interface CreateBillingTransactionProps {
    id: string;
    userId: string;
    type: BillingTransactionType;
    status: TransactionStatus;
    amount?: MoneyProps | null;
    creditsDelta: number;
    description: string;
    referenceId?: string | null;
    gatewayPaymentId?: string | null;
    gatewayOrderId?: string | null;
    receiptNumber?: string | null;
    environment?: PaymentEnvironment;
    metadata?: Record<string, string | number | boolean> | null;
}

export interface BillingTransactionProps {
    id: string;
    userId: string;
    type: BillingTransactionType;
    status: TransactionStatus;
    amount?: MoneyProps | null;
    creditsDelta: number;
    description: string;
    referenceId?: string | null;
    gatewayPaymentId?: string | null;
    gatewayOrderId?: string | null;
    receiptNumber?: string | null;
    environment?: PaymentEnvironment;
    metadata?: Record<string, string | number | boolean> | null;
    createdAt?: Date;
}

export interface BillingTransactionData {
    id: string;
    userId: string;
    type: BillingTransactionType;
    status: TransactionStatus;
    amount: MoneyProps | null;
    creditsDelta: number;
    description: string;
    referenceId: string | null;
    gatewayPaymentId: string | null;
    gatewayOrderId: string | null;
    receiptNumber: string | null;
    environment: PaymentEnvironment;
    metadata: Record<string, string | number | boolean> | null;
    createdAt: Date;
}

export interface BillingTransactionSnapshot {
    id: string;
    userId: string;
    type: BillingTransactionType;
    status: TransactionStatus;
    amount: MoneyProps | null;
    creditsDelta: number;
    description: string;
    referenceId: string | null;
    gatewayPaymentId: string | null;
    gatewayOrderId: string | null;
    receiptNumber: string | null;
    environment: PaymentEnvironment;
    metadata: Record<string, string | number | boolean> | null;
    createdAt: Date;
}
