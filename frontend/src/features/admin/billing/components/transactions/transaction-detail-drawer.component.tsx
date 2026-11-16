import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import type { AdminBillingTransactionDto } from '../../types/admin-billing.types';
import {
    PaymentEnvironmentBadge,
    TransactionStatusBadge,
    TransactionTypeBadge,
} from '../shared/billing-badge.component';
import { APP_ROUTES } from '../../../../../shared/constants/app-routes.constant';
import styles from './transaction-detail-drawer.module.css';

export interface TransactionDetailDrawerProps {
    isOpen: boolean;
    transaction: AdminBillingTransactionDto | null;
    onClose: () => void;
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
    isOpen,
    transaction,
    onClose,
}) => {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen || !transaction) return null;

    const handleCopy = (key: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    };

    const metadataEntries = transaction.metadata ? Object.entries(transaction.metadata) : [];

    return (
        <AnimatePresence>
            <div className={styles.backdrop} onClick={onClose}>
                <motion.div
                    className={styles.drawer}
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Transaction audit for ${transaction.id}`}
                >
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerMeta}>
                            <span className={styles.drawerSubtitle}>FINANCIAL AUDIT LEDGER</span>
                            <div className={styles.titleRow}>
                                <h2 className={styles.txnId} title={transaction.id}>
                                    {transaction.id}
                                </h2>
                                <button
                                    type="button"
                                    className={styles.copyBtn}
                                    onClick={() => handleCopy('id', transaction.id)}
                                    title="Copy transaction ID"
                                >
                                    {copiedKey === 'id' ? '✓' : 'Copy'}
                                </button>
                            </div>
                            <div className={styles.statusRow}>
                                <TransactionStatusBadge status={transaction.status} />
                                <PaymentEnvironmentBadge environment={transaction.environment} />
                                <span className={styles.timestamp}>
                                    {new Date(transaction.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={onClose}
                            title="Close drawer (Esc)"
                            aria-label="Close drawer"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className={styles.body}>
                        {/* Financial Summary Card */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>FINANCIAL SUMMARY</h3>
                            <div className={styles.metricGrid}>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>AMOUNT</span>
                                    <span className={styles.metricValue}>
                                        {transaction.amount ? transaction.amount.formatted : '—'}
                                    </span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>CREDITS DELTA</span>
                                    <span
                                        className={`${styles.metricValue} ${
                                            transaction.creditsDelta > 0
                                                ? styles.creditPositive
                                                : transaction.creditsDelta < 0
                                                  ? styles.creditNegative
                                                  : ''
                                        }`}
                                    >
                                        {transaction.creditsDelta > 0
                                            ? `+${transaction.creditsDelta}`
                                            : transaction.creditsDelta}
                                    </span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>LEDGER TYPE</span>
                                    <div className={styles.badgeWrapper}>
                                        <TransactionTypeBadge type={transaction.type} />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Description</span>
                                <span className={styles.infoValue}>{transaction.description || '—'}</span>
                            </div>
                        </div>

                        {/* Customer Account Context */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>CUSTOMER ACCOUNT</h3>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>User ID</span>
                                <div className={styles.idWithCopy}>
                                    <span className={styles.monoValue}>{transaction.userId}</span>
                                    <button
                                        type="button"
                                        className={styles.copyBtn}
                                        onClick={() => handleCopy('userId', transaction.userId)}
                                        title="Copy user ID"
                                    >
                                        {copiedKey === 'userId' ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.accountActionRow}>
                                <Link
                                    to={APP_ROUTES.ADMIN.USER_DETAILS(transaction.userId)}
                                    className={styles.userProfileLink}
                                    title="Open user management profile in new tab"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    View Full User Profile &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Payment Gateway Diagnostics */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>GATEWAY DIAGNOSTICS</h3>

                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Gateway Order ID</span>
                                {transaction.gatewayOrderId ? (
                                    <div className={styles.idWithCopy}>
                                        <span className={styles.monoValue}>{transaction.gatewayOrderId}</span>
                                        <button
                                            type="button"
                                            className={styles.copyBtn}
                                            onClick={() => handleCopy('orderId', transaction.gatewayOrderId!)}
                                        >
                                            {copiedKey === 'orderId' ? '✓' : 'Copy'}
                                        </button>
                                    </div>
                                ) : (
                                    <span className={styles.dimValue}>—</span>
                                )}
                            </div>

                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Gateway Payment ID</span>
                                {transaction.gatewayPaymentId ? (
                                    <div className={styles.idWithCopy}>
                                        <span className={styles.monoValue}>{transaction.gatewayPaymentId}</span>
                                        <button
                                            type="button"
                                            className={styles.copyBtn}
                                            onClick={() => handleCopy('paymentId', transaction.gatewayPaymentId!)}
                                        >
                                            {copiedKey === 'paymentId' ? '✓' : 'Copy'}
                                        </button>
                                    </div>
                                ) : (
                                    <span className={styles.dimValue}>—</span>
                                )}
                            </div>

                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Reference ID</span>
                                {transaction.referenceId ? (
                                    <div className={styles.idWithCopy}>
                                        <span className={styles.monoValue}>{transaction.referenceId}</span>
                                        <button
                                            type="button"
                                            className={styles.copyBtn}
                                            onClick={() => handleCopy('refId', transaction.referenceId!)}
                                        >
                                            {copiedKey === 'refId' ? '✓' : 'Copy'}
                                        </button>
                                    </div>
                                ) : (
                                    <span className={styles.dimValue}>—</span>
                                )}
                            </div>

                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Receipt Number</span>
                                {transaction.receiptNumber ? (
                                    <div className={styles.idWithCopy}>
                                        <span className={styles.monoValue}>{transaction.receiptNumber}</span>
                                        <button
                                            type="button"
                                            className={styles.copyBtn}
                                            onClick={() => handleCopy('receipt', transaction.receiptNumber!)}
                                        >
                                            {copiedKey === 'receipt' ? '✓' : 'Copy'}
                                        </button>
                                    </div>
                                ) : (
                                    <span className={styles.dimValue}>—</span>
                                )}
                            </div>
                        </div>

                        {/* Raw Metadata Dictionary */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>METADATA PAYLOAD</h3>
                            {metadataEntries.length > 0 ? (
                                <div className={styles.metadataContainer}>
                                    {metadataEntries.map(([key, val]) => (
                                        <div key={key} className={styles.metadataItem}>
                                            <span className={styles.metadataKey}>{key}:</span>
                                            <span className={styles.metadataVal}>
                                                {typeof val === 'boolean'
                                                    ? val
                                                        ? 'true'
                                                        : 'false'
                                                    : String(val)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyMetadata}>
                                    No metadata attached to this audit ledger entry.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
