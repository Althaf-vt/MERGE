import React, { useState, useId } from 'react';
import type { ScenarioTrendPointDto, ScenarioTimeframe } from '../../types/admin-scene-partner.types';
import { SCENARIO_TIMEFRAME_OPTIONS } from '../../constants/admin-scene-partner.constants';
import styles from './analytics-chart.module.css';

export interface AnalyticsChartProps {
    data: ScenarioTrendPointDto[];
    title?: string;
    timeframe?: ScenarioTimeframe;
    onTimeframeChange?: (timeframe: ScenarioTimeframe) => void;
    isLoading?: boolean;
    className?: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
    data = [],
    title = 'Usage & Completion Trends',
    timeframe = '30D',
    onTimeframeChange,
    isLoading = false,
    className = '',
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const gradientId = useId();

    const viewBoxWidth = 600;
    const viewBoxHeight = 200;
    const padLeft = 40;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;

    const chartWidth = viewBoxWidth - padLeft - padRight;
    const chartHeight = viewBoxHeight - padTop - padBottom;

    if (isLoading || data.length === 0) {
        return (
            <div className={`${styles.container} ${className}`.trim()}>
                <div className={styles.header}>
                    <span className={styles.title}>{title}</span>
                    {onTimeframeChange && (
                        <div className={styles.timeframeControls}>
                            {SCENARIO_TIMEFRAME_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`${styles.timeframeBtn} ${timeframe === opt.value ? styles.timeframeBtnActive : ''}`}
                                    onClick={() => onTimeframeChange(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.chartWrapper}>
                    <div className={styles.emptyState}>
                        {isLoading ? 'LOADING TELEMETRY TRENDS...' : 'NO TELEMETRY DATA AVAILABLE FOR TIMEFRAME.'}
                    </div>
                </div>
            </div>
        );
    }

    const maxSessions = Math.max(...data.map((d) => d.totalSessions), 10);
    const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth / 2;

    const points = data.map((d, index) => {
        const x = data.length > 1 ? padLeft + index * stepX : padLeft + chartWidth / 2;
        const ySessions = padTop + (1 - d.totalSessions / maxSessions) * chartHeight;
        const yCompletion = padTop + (1 - Math.min(100, Math.max(0, d.completionRate)) / 100) * chartHeight;
        return { x, ySessions, yCompletion, data: d };
    });

    const sessionsPathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.ySessions}`, '');
    const completionPathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.yCompletion}`, '');

    const areaD = points.length > 0
        ? `M ${points[0].x} ${padTop + chartHeight} ` +
          points.map((pt) => `L ${pt.x} ${pt.ySessions}`).join(' ') +
          ` L ${points[points.length - 1].x} ${padTop + chartHeight} Z`
        : '';

    const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

    return (
        <div className={`${styles.container} ${className}`.trim()}>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                {onTimeframeChange && (
                    <div className={styles.timeframeControls}>
                        {SCENARIO_TIMEFRAME_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                className={`${styles.timeframeBtn} ${timeframe === opt.value ? styles.timeframeBtnActive : ''}`}
                                onClick={() => onTimeframeChange(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.chartWrapper}>
                <svg
                    className={styles.svg}
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--admin-accent-text, #d8b4fe)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--admin-accent-text, #d8b4fe)" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    <line x1={padLeft} y1={padTop} x2={viewBoxWidth - padRight} y2={padTop} className={styles.gridLine} />
                    <text x={padLeft - 8} y={padTop + 4} textAnchor="end" className={styles.axisText}>
                        {maxSessions}
                    </text>

                    <line
                        x1={padLeft}
                        y1={padTop + chartHeight / 2}
                        x2={viewBoxWidth - padRight}
                        y2={padTop + chartHeight / 2}
                        className={styles.gridLine}
                    />
                    <text x={padLeft - 8} y={padTop + chartHeight / 2 + 4} textAnchor="end" className={styles.axisText}>
                        {Math.round(maxSessions / 2)}
                    </text>

                    <line
                        x1={padLeft}
                        y1={padTop + chartHeight}
                        x2={viewBoxWidth - padRight}
                        y2={padTop + chartHeight}
                        className={styles.gridLine}
                    />
                    <text x={padLeft - 8} y={padTop + chartHeight + 4} textAnchor="end" className={styles.axisText}>
                        0
                    </text>

                    {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}
                    {completionPathD && <path d={completionPathD} className={styles.pathCompletion} />}
                    {sessionsPathD && <path d={sessionsPathD} className={styles.pathSessions} />}

                    {hoveredPoint && (
                        <line
                            x1={hoveredPoint.x}
                            y1={padTop}
                            x2={hoveredPoint.x}
                            y2={padTop + chartHeight}
                            className={styles.hoverLine}
                        />
                    )}

                    {points.map((pt, i) => (
                        <circle
                            key={pt.data.date || i}
                            cx={pt.x}
                            cy={pt.ySessions}
                            r={hoveredIndex === i ? 5 : 3}
                            className={styles.dataDot}
                            onMouseEnter={() => setHoveredIndex(i)}
                        />
                    ))}

                    {points.map((pt, i) => {
                        const showLabel =
                            points.length <= 7 ||
                            i === 0 ||
                            i === points.length - 1 ||
                            i % Math.ceil(points.length / 5) === 0;

                        if (!showLabel) return null;

                        return (
                            <text
                                key={`date-${pt.data.date}-${i}`}
                                x={pt.x}
                                y={padTop + chartHeight + 18}
                                textAnchor="middle"
                                className={styles.axisText}
                            >
                                {pt.data.date}
                            </text>
                        );
                    })}
                </svg>

                {hoveredPoint && (
                    <div
                        className={styles.tooltip}
                        style={{
                            left: `${(hoveredPoint.x / viewBoxWidth) * 100}%`,
                            top: `${(hoveredPoint.ySessions / viewBoxHeight) * 100}%`,
                        }}
                    >
                        <div className={styles.tooltipDate}>{hoveredPoint.data.date}</div>
                        <div className={styles.tooltipRow}>
                            <span>Sessions:</span>
                            <strong>{hoveredPoint.data.totalSessions.toLocaleString()}</strong>
                        </div>
                        <div className={styles.tooltipRow}>
                            <span>Completion:</span>
                            <strong>{hoveredPoint.data.completionRate.toFixed(1)}%</strong>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendDotSessions} />
                    <span>Total Sessions</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendDotCompletion} />
                    <span>Completion Rate</span>
                </div>
            </div>
        </div>
    );
};
