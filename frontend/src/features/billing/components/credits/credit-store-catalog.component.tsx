import React from 'react';
import type { CreditPackDto } from '../../types/billing.types';
import { CreditPackCard } from '../hub/credit-pack-card.component';
import styles from './credit-store-catalog.module.css';

export interface CreditStoreCatalogProps {
    packs?: CreditPackDto[];
    selectedPackId?: string | null;
    onSelectPack: (pack: CreditPackDto) => void;
    isLoading?: boolean;
    title?: string;
    subtitle?: string;
}

export const CreditStoreCatalog: React.FC<CreditStoreCatalogProps> = ({
    packs = [],
    selectedPackId,
    onSelectPack,
    isLoading = false,
    title = 'Buy Credits',
    subtitle = 'Bypass the algorithmic queue with Priority Introductions directly to member inboxes.',
}) => {
    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>
                <div className={styles.grid}>
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                </div>
            </div>
        );
    }

    if (packs.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>
                <div className={styles.emptyState}>
                    No credit packs available at this time. Please check back later.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>

            <div className={styles.grid}>
                {packs.map((pack) => (
                    <CreditPackCard
                        key={pack.id}
                        pack={pack}
                        isSelected={selectedPackId === pack.id}
                        onSelect={onSelectPack}
                    />
                ))}
            </div>
        </div>
    );
};
