import type { AdminBillingTransactionDto } from '../types/admin-billing.types';

export const exportTransactionsToCsv = (
    transactions: AdminBillingTransactionDto[],
    filenamePrefix: string = 'merge_billing_transactions'
): void => {
    if (!transactions || transactions.length === 0) {
        return;
    }

    const headers = [
        'Transaction ID',
        'User ID',
        'Type',
        'Status',
        'Amount',
        'Currency',
        'Credits Delta',
        'Description',
        'Reference ID',
        'Gateway Order ID',
        'Gateway Payment ID',
        'Receipt Number',
        'Environment',
        'Created At',
    ];

    const escapeCsvCell = (val: string | number | null | undefined): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const rows = transactions.map((t) => [
        escapeCsvCell(t.id),
        escapeCsvCell(t.userId),
        escapeCsvCell(t.type),
        escapeCsvCell(t.status),
        escapeCsvCell(t.amount ? t.amount.amount : ''),
        escapeCsvCell(t.amount ? t.amount.currency : ''),
        escapeCsvCell(t.creditsDelta),
        escapeCsvCell(t.description),
        escapeCsvCell(t.referenceId),
        escapeCsvCell(t.gatewayOrderId),
        escapeCsvCell(t.gatewayPaymentId),
        escapeCsvCell(t.receiptNumber),
        escapeCsvCell(t.environment),
        escapeCsvCell(t.createdAt),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    link.setAttribute('href', url);
    link.setAttribute('download', `${filenamePrefix}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
