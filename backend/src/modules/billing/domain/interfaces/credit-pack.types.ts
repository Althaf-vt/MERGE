import { MoneyProps } from './billing-value-objects.types';

export interface CreateCreditPackProps {
    id: string;
    name: string;
    code: string;
    creditsCount: number;
    price: MoneyProps;
    badge?: string | null;
    sortOrder?: number;
    isListed?: boolean;
    isActive?: boolean;
}

export interface UpdateCreditPackProps {
    name: string;
    creditsCount: number;
    price: MoneyProps;
    badge?: string | null;
    sortOrder?: number;
}

export interface CreditPackProps {
    id: string;
    name: string;
    code: string;
    creditsCount: number;
    price: MoneyProps;
    badge?: string | null;
    sortOrder?: number;
    isListed?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreditPackData {
    id: string;
    name: string;
    code: string;
    creditsCount: number;
    price: MoneyProps;
    badge: string | null;
    sortOrder: number;
    isListed: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreditPackSnapshot {
    id: string;
    name: string;
    code: string;
    creditsCount: number;
    price: MoneyProps;
    badge: string | null;
    sortOrder: number;
    isListed: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
