/**
 * Network Configuration
 * Centralizes all network-related constants for multi-chain support
 */

export const NETWORKS = {
  hoodi: {
    chainId: 560048,
    name: 'Hoodi',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://0xrpc.io/hoodi',
    blockExplorer: 'https://explorer.hoodi.ethpandaops.io',
    isTestnet: true,
  },
  // Future networks can be added here
  // mainnet: { chainId: 1, name: 'Ethereum Mainnet', ... },
};

export const DEFAULT_NETWORK = 'hoodi';
export const DEFAULT_CHAIN_ID = NETWORKS[DEFAULT_NETWORK].chainId;

/**
 * Get network configuration by chain ID
 * @param {number} chainId - The chain ID to look up
 * @returns {Object|null} Network configuration or null if not found
 */
export function getNetworkByChainId(chainId) {
  return Object.values(NETWORKS).find(n => n.chainId === chainId) || null;
}

/**
 * Get network name by chain ID
 * @param {number} chainId - The chain ID to look up
 * @returns {string|null} Network name or null if not found
 */
export function getNetworkNameByChainId(chainId) {
  const entry = Object.entries(NETWORKS).find(([_, config]) => config.chainId === chainId);
  return entry ? entry[0] : null;
}

/**
 * Check if a chain ID is supported
 * @param {number} chainId - The chain ID to check
 * @returns {boolean} True if the network is supported
 */
export function isNetworkSupported(chainId) {
  return !!getNetworkByChainId(chainId);
}

/**
 * Get all supported chain IDs
 * @returns {number[]} Array of supported chain IDs
 */
export function getSupportedChainIds() {
  return Object.values(NETWORKS).map(n => n.chainId);
}
