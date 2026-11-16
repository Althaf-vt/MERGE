import React from 'react';
import type { AdminCreditPackDto } from '../../types/admin-billing.types';
import { AdminTable, type AdminTableColumn } from '../../../../../shared/admin/components/admin-table.component';
import styles from './credit-pack-table.module.css';

export interface CreditPackTableProps {
    creditPacks: AdminCreditPackDto[];
    isLoading?: boolean;
    isFetching?: boolean;
    onEditPack: (pack: AdminCreditPackDto) => void;
    onToggleListed: (pack: AdminCreditPackDto) => void;
    onToggleActive: (pack: AdminCreditPackDto) => void;
    onViewPack?: (pack: AdminCreditPackDto) => void;
    togglingPackId?: string | null;
}

export const CreditPackTable: React.FC<CreditPackTableProps> = ({
    creditPacks,
    isLoading = false,
    isFetching = false,
    onEditPack,
    onToggleListed,
    onToggleActive,
    onViewPack,
    togglingPackId = null,
}) => {
    const columns: AdminTableColumn<AdminCreditPackDto>[] = [
        {
            header: 'PACKAGE NAME',
            render: (pack) => (
                <div
                    className={styles.packNameCell}
                    onClick={() => onViewPack?.(pack)}
                    title="Click to view pack details"
                >
                    <span className={styles.packName}>{pack.name}</span>
                    <span className={styles.packCode}>{pack.code}</span>
                </div>
            ),
        },
        {
            header: 'CREDITS',
            render: (pack) => (
                <span className={styles.creditsBadge}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    {pack.creditsCount} Credits
                </span>
            ),
        },
        {
            header: 'PRICE',
            render: (pack) => {
                const unitPrice =
                    pack.creditsCount > 0
                        ? (pack.price.amount / pack.creditsCount).toFixed(2)
                        : null;
                return (
                    <div className={styles.priceCell}>
                        <span className={styles.priceFormatted}>{pack.price.formatted}</span>
                        {unitPrice && (
                            <span className={styles.unitPrice}>₹{unitPrice} / credit</span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'MARKETING BADGE',
            render: (pack) =>
                pack.badge ? (
                    <span className={styles.badgeTag}>{pack.badge}</span>
                ) : (
                    <span className={styles.noBadge}>&mdash;</span>
                ),
        },
        {
            header: 'STORE LISTED',
            render: (pack) => {
                const isToggling = togglingPackId === pack.id;
                return (
                    <button
                        type="button"
                        className={styles.statusToggleBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleListed(pack);
                        }}
                        disabled={isToggling}
                        title={pack.isListed ? 'Hide from store catalog' : 'List in store catalog'}
                    >
                        <div
                            className={`${styles.switchTrack} ${
                                pack.isListed ? styles.switchTrackActive : ''
                            }`}
                        >
                            <div
                                className={`${styles.switchThumb} ${
                                    pack.isListed ? styles.switchThumbActive : ''
                                }`}
                            />
                        </div>
                        <span
                            className={`${styles.statusText} ${
                                pack.isListed ? styles.statusTextActive : styles.statusTextInactive
                            }`}
                        >
                            {pack.isListed ? 'LISTED' : 'HIDDEN'}
                        </span>
                    </button>
                );
            },
        },
        {
            header: 'STATUS',
            render: (pack) => {
                const isToggling = togglingPackId === pack.id;
                return (
                    <button
                        type="button"
                        className={styles.statusToggleBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleActive(pack);
                        }}
                        disabled={isToggling}
                        title={pack.isActive ? 'Disable package' : 'Enable package'}
                    >
                        <div
                            className={`${styles.switchTrack} ${
                                pack.isActive ? styles.switchTrackActive : ''
                            }`}
                        >
                            <div
                                className={`${styles.switchThumb} ${
                                    pack.isActive ? styles.switchThumbActive : ''
                                }`}
                            />
                        </div>
                        <span
                            className={`${styles.statusText} ${
                                pack.isActive ? styles.statusTextActive : styles.statusTextInactive
                            }`}
                        >
                            {pack.isActive ? 'ENABLED' : 'DISABLED'}
                        </span>
                    </button>
                );
            },
        },
        {
            header: 'ACTIONS',
            render: (pack) => (
                <div className={styles.actionsGroup}>
                    <button
                        type="button"
                        className={styles.actionIconBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditPack(pack);
                        }}
                        title="Edit Package"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                    </button>
                    {onViewPack && (
                        <button
                            type="button"
                            className={styles.actionIconBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewPack(pack);
                            }}
                            title="View Package Details"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <AdminTable
                columns={columns}
                data={creditPacks}
                keyExtractor={(pack) => pack.id}
                isLoading={isLoading}
                isFetching={isFetching}
                loadingMessage="LOADING CREDIT PACKAGES..."
                emptyMessage="NO CREDIT PACKAGES CONFIGURED."
                onRowClick={onViewPack}
            />
        </div>
    );
};
