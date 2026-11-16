export interface DeductCreditParams {
    amount: number;
    reason: string;
    referenceId?: string;
}

export interface TopUpCreditParams {
    amount: number;
    reason: string;
    referenceId?: string;
}

export interface CreditAccountProps {
    id: string;
    userId: string;
    balance: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreditAccountData {
    id: string;
    userId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreditAccountSnapshot {
    id: string;
    userId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}
