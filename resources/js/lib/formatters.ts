/**
 * Purpose: Domain Formatting Utilities (IDR Currency, Indonesian Dates, 90-Minute Durations)
 * Domain Context: Used across Finance (`Vascular System`), Events (`Lungs`), and Dashboard views
 * Key Dependencies: Standard Intl API
 */

/**
 * Formats a numeric value into Indonesian Rupiah (`Rp 1.525.000`).
 *
 * @param amount - Monetary value in IDR
 * @returns Formatted IDR currency string
 */
export function formatIdr(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Formats an ISO date string into a readable editorial timestamp.
 *
 * @param isoDate - ISO 8601 date string
 * @returns Human-readable date string
 */
export function formatEditorialDate(isoDate: string): string {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
        return isoDate;
    }

    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(parsed);
}

/**
 * Formats duration in minutes for the 90-minute Lungs run sheet.
 *
 * @param minutes - Segment duration in minutes
 * @returns Compact monospace duration tag (e.g., `15 MIN`)
 */
export function formatDurationTag(minutes: number): string {
    return `${minutes} MIN`;
}
