// networks.js
//
// Per-chain contract address registry. Replaces hardcoded polygonAmoy
// constants in web3Context.js so a connected wallet on Arbitrum or
// Gnosis can resolve the correct AccountManager (and any future
// org-level contract) at runtime instead of always hitting the
// polygonAmoy address.
//
// Each entry under `CONTRACT_ADDRESSES_BY_CHAIN_ID[chainId]` must
// hold the chain-specific address for that contract. The `getContractAddress`
// helper resolves with a polygonAmoy fallback for backward compat — any
// caller that doesn't pass `chainId` still works against the current
// production chain.
//
// IDs match the standard EIP-155 chainIds:
//   100      = Gnosis (mainnet)
//   137      = Polygon (mainnet)
//   10       = Optimism (mainnet)
//   42161    = Arbitrum (mainnet)
//   8453     = Base (mainnet)
//   11155111 = Sepolia (testnet)
//   80002    = Polygon Amoy (current poa.box default)

export const SUPPORTED_CHAIN_IDS = [100, 137, 10, 42161, 8453, 11155111, 80002];

export const CONTRACT_ADDRESSES_BY_CHAIN_ID = {
  // Polygon Amoy (current default — only chain with deployed AccountManager today).
  80002: {
    AccountManager: '0x2347046e7D8Bde6B6dCF1C493F0c0AC2406be93f',
  },
  // Other chains have no AccountManager deployed yet — entries here are
  // intentionally empty so callers get an explicit warning at the
  // resolver instead of silently using the polygonAmoy address.
  100: {},
  137: {},
  10: {},
  42161: {},
  8453: {},
  11155111: {},
};

const DEFAULT_CHAIN_ID = 80002;

export function isSupportedChain(chainId) {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}

export function getContractAddress(contractName, chainId) {
  const effectiveChainId = chainId || DEFAULT_CHAIN_ID;
  const chainContracts = CONTRACT_ADDRESSES_BY_CHAIN_ID[effectiveChainId];
  if (chainContracts && chainContracts[contractName]) {
    return chainContracts[contractName];
  }
  if (chainId && chainId !== DEFAULT_CHAIN_ID) {
    if (typeof window !== 'undefined') {
      console.warn(
        `[networks] ${contractName} not deployed on chainId=${chainId}; ` +
          `falling back to chainId=${DEFAULT_CHAIN_ID}`
      );
    }
  }
  return CONTRACT_ADDRESSES_BY_CHAIN_ID[DEFAULT_CHAIN_ID][contractName];
}
