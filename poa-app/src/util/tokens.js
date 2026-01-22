/**
 * Token configuration for bounty payments
 * These are the supported ERC-20 tokens for task bounties on the POP protocol
 */

// Hoodi testnet token addresses
// TODO: Replace with mainnet addresses when deploying to production
export const BOUNTY_TOKENS = {
    // Native participation token payout (address zero means PT payout)
    NONE: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'PT',
        name: 'Participation Token',
        decimals: 18,
        isDefault: true,
    },
    // BREAD token - Hoodi testnet
    BREAD: {
        address: '0x0000000000000000000000000000000000000001', // TODO: Add actual BREAD address
        symbol: 'BREAD',
        name: 'BREAD',
        decimals: 18,
        isDefault: false,
    },
    // USDC stablecoin
    USDC: {
        address: '0x0000000000000000000000000000000000000002', // TODO: Add actual USDC address
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        isDefault: false,
    },
    // DAI stablecoin
    DAI: {
        address: '0x0000000000000000000000000000000000000003', // TODO: Add actual DAI address
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
        isDefault: false,
    },
};

// Array of tokens for dropdown selectors
export const BOUNTY_TOKEN_OPTIONS = Object.values(BOUNTY_TOKENS);

// Get token info by address
export function getTokenByAddress(address) {
    if (!address || address === '0x0000000000000000000000000000000000000000') {
        return BOUNTY_TOKENS.NONE;
    }
    const normalizedAddress = address.toLowerCase();
    return BOUNTY_TOKEN_OPTIONS.find(
        token => token.address.toLowerCase() === normalizedAddress
    ) || {
        address: address,
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18,
        isDefault: false,
    };
}

// Get token info by symbol
export function getTokenBySymbol(symbol) {
    return BOUNTY_TOKENS[symbol.toUpperCase()] || BOUNTY_TOKENS.NONE;
}

// Format token amount based on decimals
export function formatBountyAmount(amount, tokenAddress) {
    const token = getTokenByAddress(tokenAddress);
    const divisor = Math.pow(10, token.decimals);
    const formatted = (Number(amount) / divisor).toFixed(token.decimals === 6 ? 2 : 4);
    return `${formatted} ${token.symbol}`;
}

// Check if bounty is set (non-zero address and amount)
export function hasBounty(bountyToken, bountyAmount) {
    return bountyToken &&
           bountyToken !== '0x0000000000000000000000000000000000000000' &&
           bountyAmount &&
           Number(bountyAmount) > 0;
}
