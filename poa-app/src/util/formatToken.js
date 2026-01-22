/**
 * Format token amounts from BigInt (with 18 decimals) to human-readable format
 * All values from subgraph are assumed to be in wei (18 decimals)
 * @param {string|number|bigint} value - The token amount in wei (18 decimals)
 * @param {number} decimals - Number of decimals in the token (default 18)
 * @param {number} displayDecimals - Number of decimals to show in display (default 0)
 * @returns {string} Formatted token amount
 */
export function formatTokenAmount(value, decimals = 18, displayDecimals = 0) {
    // Handle null, undefined, empty string, zero
    if (value === null || value === undefined || value === '' || value === '0' || value === 0) {
        return '0';
    }

    try {
        // Handle string, number, or bigint input
        let valueStr = typeof value === 'bigint' ? value.toString() : String(value);

        // Remove any non-numeric characters (keeps minus for negative, but we don't expect negatives)
        valueStr = valueStr.replace(/[^0-9]/g, '');

        if (!valueStr || valueStr === '0') {
            return '0';
        }

        // Always treat as wei (18 decimals) from subgraph
        // Pad with leading zeros if shorter than decimals+1 to ensure proper slicing
        const paddedValue = valueStr.padStart(decimals + 1, '0');

        // Split into integer and decimal parts
        // E.g., "50000000000000000000" (50 tokens) -> integerPart="50", decimalPart="000000000000000000"
        const integerPart = paddedValue.slice(0, -decimals) || '0';
        const decimalPart = paddedValue.slice(-decimals);

        // Remove leading zeros from integer part
        const cleanIntegerPart = integerPart.replace(/^0+/, '') || '0';

        // Format based on displayDecimals
        if (displayDecimals === 0) {
            // Round to nearest integer
            const firstDecimal = parseInt(decimalPart[0] || '0', 10);
            const intValue = parseInt(cleanIntegerPart, 10);
            return String(firstDecimal >= 5 ? intValue + 1 : intValue);
        }

        // Return with specified decimal places
        const truncatedDecimal = decimalPart.slice(0, displayDecimals);
        return `${cleanIntegerPart}.${truncatedDecimal}`;
    } catch (error) {
        console.error('Error formatting token amount:', error, value);
        return '0';
    }
}

/**
 * Parse token display amount to wei (18 decimals)
 * @param {string|number} amount - Human-readable token amount
 * @param {number} decimals - Number of decimals (default 18)
 * @returns {string} Token amount in wei
 */
export function parseTokenAmount(amount, decimals = 18) {
    if (!amount || amount === '0') return '0';

    try {
        const amountStr = String(amount);
        const [intPart, decPart = ''] = amountStr.split('.');

        // Pad or truncate decimal part
        const paddedDecimal = decPart.padEnd(decimals, '0').slice(0, decimals);

        // Combine and remove leading zeros
        const weiValue = (intPart + paddedDecimal).replace(/^0+/, '') || '0';

        return weiValue;
    } catch (error) {
        console.error('Error parsing token amount:', error, amount);
        return '0';
    }
}
