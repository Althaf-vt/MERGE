import React from 'react';
import styles from './admin-table.module.css';

export interface AdminTableColumn<T> {
    id?: string;
    header: React.ReactNode;
    render: (item: T, index: number) => React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    headerStyle?: React.CSSProperties;
}

export interface AdminTableProps<T> {
    columns: AdminTableColumn<T>[];
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    isLoading?: boolean;
    isFetching?: boolean;
    loadingMessage?: string;
    emptyMessage?: string;
    wrapperClassName?: string;
    tableClassName?: string;
    onRowClick?: (item: T) => void;
}

export function AdminTable<T>({
    columns,
    data,
    keyExtractor,
    isLoading = false,
    isFetching = false,
    loadingMessage = 'INITIALIZING DATA STREAM...',
    emptyMessage = 'NO RECORDS FOUND.',
    wrapperClassName = '',
    tableClassName = '',
    onRowClick,
}: AdminTableProps<T>): React.ReactElement {
    return (
        <div className={`${styles.tableWrapper} ${wrapperClassName}`.trim()}>
            <table className={`${styles.table} ${tableClassName}`.trim()}>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={column.id || index}
                                className={column.className}
                                style={column.headerStyle}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.loadingCell}>
                                {loadingMessage}
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.emptyCell}>
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr
                                key={keyExtractor(item, index)}
                                className={`${styles.row} ${onRowClick ? styles.clickableRow : ''}`}
                                style={{ opacity: isFetching ? 0.5 : 1 }}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={column.id || colIndex}
                                        className={column.className}
                                        style={column.style}
                                    >
                                        {column.render(item, index)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

