import React from 'react';
import type { CreditPackDto } from '../../types/billing.types';
import { formatCurrencyDisplay } from '../../utils/currency.util';
import styles from './credit-pack-card.module.css';

export interface CreditPackCardProps {
    pack: CreditPackDto;
    isSelected: boolean;
    onSelect: (pack: CreditPackDto) => void;
    disabled?: boolean;
}

export const CreditPackCard: React.FC<CreditPackCardProps> = ({
    pack,
    isSelected,
    onSelect,
    disabled = false,
}) => {
    // Sanitize pack name if legacy brackets are present
    const displayName = pack.name.replace(/\s*\(\d+\s*Credits\)/i, '').trim();

    const handleClick = () => {
        if (!disabled) {
            onSelect(pack);
        }
    };

    return (
        <div
            className={`${styles.card} ${isSelected ? styles.selected : ''}`}
            onClick={handleClick}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                    e.preventDefault();
                    onSelect(pack);
                }
            }}
            aria-pressed={isSelected}
            aria-disabled={disabled}
        >
            {pack.badge && <span className={styles.badge}>{pack.badge}</span>}

            <span className={styles.packName}>{displayName}</span>

            <div className={styles.creditsRow}>
                <span className={styles.creditsCount}>{pack.creditsCount}</span>
                <span className={styles.creditsLabel}>Credits</span>
            </div>

            <div className={styles.priceTag}>{formatCurrencyDisplay(pack.price.formatted)}</div>

            <button
                type="button"
                className={styles.selectButton}
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
                disabled={disabled}
            >
                {isSelected ? 'Selected' : 'Select'}
            </button>
        </div>
    );
};
