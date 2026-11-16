export const formatCurrencyDisplay = (formatted?: string | null): string => {
    if (!formatted) return '';
    return formatted
        .replace(/^INR\s*/i, '₹')
        .replace(/^USD\s*/i, '$');
};
