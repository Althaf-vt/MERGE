import React from 'react';
import styles from './metric-card.module.css';

export interface MetricTrend {
    value: string | number;
    direction?: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
}

export interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: MetricTrend;
    icon?: React.ReactNode;
    isLoading?: boolean;
    className?: string;
    onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    trend,
    icon,
    isLoading = false,
    className = '',
    onClick,
}) => {
    const resolveTrendClass = () => {
        if (!trend) return '';
        if (trend.isPositive === true || trend.direction === 'up') {
            return styles.trendPositive;
        }
        if (trend.isPositive === false || trend.direction === 'down') {
            return styles.trendNegative;
        }
        return styles.trendNeutral;
    };

    return (
        <div
            className={`${styles.card} ${onClick ? styles.clickable : ''} ${className}`.trim()}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                {icon && <span className={styles.icon}>{icon}</span>}
            </div>

            <div className={styles.body}>
                {isLoading ? (
                    <div className={styles.skeletonValue} />
                ) : (
                    <span className={styles.value}>{value}</span>
                )}

                {trend && !isLoading && (
                    <span className={`${styles.trend} ${resolveTrendClass()}`}>
                        {trend.direction === 'up' && '↑'}
                        {trend.direction === 'down' && '↓'}
                        {trend.value}
                    </span>
                )}
            </div>

            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
    );
};
