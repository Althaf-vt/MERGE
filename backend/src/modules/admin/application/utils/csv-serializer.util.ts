import { StreamableFile } from '@nestjs/common';
import { AdminScenarioExportItemFacadeDto } from '../../../scene-partner/application/interfaces/scene-partner-admin-facade.interface';

export interface CsvColumn<T> {
    header: string;
    accessor: (item: T) => unknown;
}

export class CsvSerializer {
    public static readonly MIME_TYPE = 'text/csv; charset=utf-8';

    private static readonly UTF8_BOM = '\uFEFF';
    private static readonly CRLF = '\r\n';

    /**
     * Strongly-typed column definitions binding headers to field accessors.
     * Serves as the single source of truth for CSV column structure and order.
     */
    private static readonly SCENARIO_COLUMNS: CsvColumn<AdminScenarioExportItemFacadeDto>[] = [
        { header: 'ID', accessor: (s) => s.id },
        { header: 'Title', accessor: (s) => s.title },
        { header: 'Category', accessor: (s) => s.category },
        { header: 'Description', accessor: (s) => s.description },
        { header: 'Prompt Context', accessor: (s) => s.promptContext },
        { header: 'Active', accessor: (s) => s.isActive },
        { header: 'Custom', accessor: (s) => s.isCustom },
        { header: 'Creator User ID', accessor: (s) => s.creatorUserId ?? '' },
        { header: 'Total Sessions', accessor: (s) => s.totalSessions },
        { header: 'Completed Sessions', accessor: (s) => s.completedSessions },
        { header: 'Completion Rate (%)', accessor: (s) => s.completionRate },
        { header: 'Created At', accessor: (s) => s.createdAt },
        { header: 'Updated At', accessor: (s) => s.updatedAt },
    ];

    /**
     * Formats and escapes a single cell value according to RFC 4180:
     * - Null/undefined values become empty quoted string ""
     * - Booleans format as "true" or "false"
     * - Numbers format as strings (e.g. "10", "85.5")
     * - Dates format as ISO strings
     * - Internal quotes are escaped by doubling them (" -> "")
     * - Strings with newlines or commas are safely enclosed in quotes
     */
    public static escapeCell(value: unknown): string {
        if (value === null || value === undefined) {
            return '""';
        }
        if (typeof value === 'boolean') {
            return value ? '"true"' : '"false"';
        }
        if (typeof value === 'number') {
            return `"${value}"`;
        }
        if (value instanceof Date) {
            return `"${value.toISOString()}"`;
        }

        const str = String(value);
        // Normalize CRLF / CR line breaks to LF inside cell content
        const normalized = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // RFC 4180: double internal quotes
        const escaped = normalized.replace(/"/g, '""');
        return `"${escaped}"`;
    }

    /**
     * Serializes an array of AdminScenarioExportItemFacadeDto items to an RFC 4180-compliant CSV string
     * with UTF-8 Byte Order Mark (\uFEFF) for Microsoft Excel compatibility.
     */
    public static serializeScenarios(items: AdminScenarioExportItemFacadeDto[]): string {
        const headerRow = this.SCENARIO_COLUMNS.map((col) => this.escapeCell(col.header)).join(',');

        if (!items || items.length === 0) {
            return `${this.UTF8_BOM}${headerRow}${this.CRLF}`;
        }

        const dataRows = items.map((item) =>
            this.SCENARIO_COLUMNS.map((col) => this.escapeCell(col.accessor(item))).join(',')
        );

        return `${this.UTF8_BOM}${headerRow}${this.CRLF}${dataRows.join(this.CRLF)}${this.CRLF}`;
    }

    /**
     * Generates a standardized, date-stamped filename for scenario exports.
     * E.g. "merge-scenarios-export-2026-11-15.csv"
     */
    public static generateFilename(date: Date = new Date()): string {
        const dateStr = date.toISOString().split('T')[0];
        return `merge-scenarios-export-${dateStr}.csv`;
    }

    /**
     * Converts an array of scenario export DTOs directly into a NestJS StreamableFile
     * configured with RFC 4180 CSV headers, UTF-8 BOM, and standard Content-Disposition.
     */
    public static toStreamableFile(items: AdminScenarioExportItemFacadeDto[], date?: Date): StreamableFile {
        const csv = this.serializeScenarios(items);
        const filename = this.generateFilename(date);

        return new StreamableFile(Buffer.from(csv, 'utf-8'), {
            type: this.MIME_TYPE,
            disposition: `attachment; filename="${filename}"`,
        });
    }
}
