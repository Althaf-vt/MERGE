import React from 'react';
import styles from './billing-badge.module.css';
import {
    PAYMENT_ENVIRONMENT_CONFIG,
    TRANSACTION_STATUS_CONFIG,
    TRANSACTION_TYPE_CONFIG,
    type BadgeVariant,
} from '../../constants/admin-billing.constants';
import type {
    BillingTransactionType,
    PaymentEnvironment,
    TransactionStatus,
} from '../../types/admin-billing.types';

export interface BillingBadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    dot?: boolean;
    className?: string;
}

export const BillingBadge: React.FC<BillingBadgeProps> = ({
    children,
    variant = 'default',
    dot = false,
    className = '',
}) => {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${className}`.trim()}>
            {dot && <span className={`${styles.dot} ${styles[`dot_${variant}`]}`} />}
            {children}
        </span>
    );
};

export const TransactionTypeBadge: React.FC<{ type: BillingTransactionType; className?: string }> = ({
    type,
    className,
}) => {
    const config = TRANSACTION_TYPE_CONFIG[type];
    return (
        <BillingBadge variant={config?.badgeVariant || 'default'} className={className}>
            {config?.label || type}
        </BillingBadge>
    );
};

export const TransactionStatusBadge: React.FC<{ status: TransactionStatus; className?: string }> = ({
    status,
    className,
}) => {
    const config = TRANSACTION_STATUS_CONFIG[status];
    return (
        <BillingBadge variant={config?.badgeVariant || 'default'} dot className={className}>
            {config?.label || status}
        </BillingBadge>
    );
};

export const PaymentEnvironmentBadge: React.FC<{ environment: PaymentEnvironment; className?: string }> = ({
    environment,
    className,
}) => {
    const config = PAYMENT_ENVIRONMENT_CONFIG[environment];
    return (
        <BillingBadge variant={config?.badgeVariant || 'default'} className={className}>
            {config?.label || environment}
        </BillingBadge>
    );
};

export const PlanStatusBadge: React.FC<{ isActive: boolean; className?: string }> = ({
    isActive,
    className,
}) => {
    return (
        <BillingBadge variant={isActive ? 'success' : 'muted'} dot className={className}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
        </BillingBadge>
    );
};
