/**
 * Gas Configuration
 * Centralizes gas-related constants and utilities
 */

import { ethers } from 'ethers';

/**
 * Gas configuration constants
 */
export const GAS_CONFIG = {
  // Default gas price in gwei (fallback if dynamic pricing fails)
  // Increased to 3 gwei for faster transaction confirmation
  defaultGasPriceGwei: '3',

  // Gas limit multiplier as percentage (130 = 30% buffer for faster inclusion)
  gasLimitMultiplier: 130,

  // Higher multiplier for delete/cancel operations (140 = 40% buffer)
  deleteGasMultiplier: 140,

  // Divisor for percentage calculation
  gasLimitDivisor: 100,

  // Maximum gas price to prevent runaway costs (in gwei)
  maxGasPriceGwei: '50',

  // Minimum gas price (in gwei)
  minGasPriceGwei: '0.1',
};

/**
 * Get the default gas price as a BigNumber
 * @returns {BigNumber} Gas price in wei
 */
export function getDefaultGasPrice() {
  return ethers.utils.parseUnits(GAS_CONFIG.defaultGasPriceGwei, 'gwei');
}

/**
 * Get maximum allowed gas price as a BigNumber
 * @returns {BigNumber} Maximum gas price in wei
 */
export function getMaxGasPrice() {
  return ethers.utils.parseUnits(GAS_CONFIG.maxGasPriceGwei, 'gwei');
}

/**
 * Calculate gas limit with safety buffer
 * @param {BigNumber} estimate - Gas estimate from contract
 * @param {boolean} [isDelete=false] - Whether this is a delete/cancel operation
 * @returns {BigNumber} Gas limit with buffer applied
 */
export function calculateGasLimit(estimate, isDelete = false) {
  const multiplier = isDelete
    ? GAS_CONFIG.deleteGasMultiplier
    : GAS_CONFIG.gasLimitMultiplier;

  return estimate.mul(multiplier).div(GAS_CONFIG.gasLimitDivisor);
}

/**
 * Create gas options object for a transaction
 * @param {BigNumber} gasEstimate - Gas estimate from contract
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [options.isDelete=false] - Whether this is a delete operation
 * @param {BigNumber} [options.gasPrice] - Override gas price
 * @returns {Object} Gas options for transaction
 */
export function createGasOptions(gasEstimate, options = {}) {
  const { isDelete = false, gasPrice } = options;

  return {
    gasLimit: calculateGasLimit(gasEstimate, isDelete),
    gasPrice: gasPrice || getDefaultGasPrice(),
  };
}

/**
 * Clamp gas price within acceptable bounds
 * @param {BigNumber} gasPrice - Proposed gas price
 * @returns {BigNumber} Clamped gas price
 */
export function clampGasPrice(gasPrice) {
  const min = ethers.utils.parseUnits(GAS_CONFIG.minGasPriceGwei, 'gwei');
  const max = getMaxGasPrice();

  if (gasPrice.lt(min)) return min;
  if (gasPrice.gt(max)) return max;
  return gasPrice;
}
