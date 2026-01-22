/**
 * Contract Address Registry
 * Centralizes all contract addresses per network
 */

import { NETWORKS, getNetworkNameByChainId } from './networks';

/**
 * Infrastructure contracts deployed across networks
 * These are singleton contracts used by the entire protocol
 */
export const INFRASTRUCTURE_CONTRACTS = {
  hoodi: {
    universalAccountRegistry: '0xDdB1DA30020861d92c27aE981ac0f4Fe8BA536F2',
  },
  // Future networks
  // mainnet: { universalAccountRegistry: '0x...' },
};

/**
 * Get infrastructure contract address
 * @param {string} contractName - Name of the contract (e.g., 'universalAccountRegistry')
 * @param {number} [chainId=560048] - Network chain ID
 * @returns {string|null} Contract address or null if not found
 */
export function getInfrastructureAddress(contractName, chainId = NETWORKS.hoodi.chainId) {
  // Use nullish coalescing to handle explicit null values (e.g., from services that don't specify chainId)
  const effectiveChainId = chainId ?? NETWORKS.hoodi.chainId;
  const networkName = getNetworkNameByChainId(effectiveChainId);
  if (!networkName) {
    console.warn(`No network found for chain ID: ${effectiveChainId}`);
    return null;
  }

  const contracts = INFRASTRUCTURE_CONTRACTS[networkName];
  if (!contracts) {
    console.warn(`No contracts deployed on network: ${networkName}`);
    return null;
  }

  const address = contracts[contractName];
  if (!address) {
    console.warn(`Contract ${contractName} not found on network: ${networkName}`);
    return null;
  }

  return address;
}

/**
 * Contract name constants to avoid typos
 */
export const CONTRACT_NAMES = {
  UNIVERSAL_ACCOUNT_REGISTRY: 'universalAccountRegistry',
};

/**
 * Get the Universal Account Registry address for a chain
 * @param {number} [chainId] - Network chain ID (defaults to Hoodi)
 * @returns {string|null} Contract address
 */
export function getUniversalAccountRegistryAddress(chainId) {
  return getInfrastructureAddress(CONTRACT_NAMES.UNIVERSAL_ACCOUNT_REGISTRY, chainId);
}
