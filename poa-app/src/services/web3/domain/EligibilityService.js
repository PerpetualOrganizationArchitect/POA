/**
 * EligibilityService
 * Handles hat claiming and vouching operations via EligibilityModule contract
 */

import EligibilityModuleABI from '../../../../abi/EligibilityModuleNew.json';
import { requireAddress } from '../utils/validation';

/**
 * EligibilityService - Hat claiming and vouching management
 */
export class EligibilityService {
  /**
   * @param {ContractFactory} contractFactory - Contract factory instance
   * @param {TransactionManager} transactionManager - Transaction manager instance
   */
  constructor(contractFactory, transactionManager) {
    this.factory = contractFactory;
    this.txManager = transactionManager;
  }

  /**
   * Claim a hat that the user is eligible for
   * @param {string} contractAddress - EligibilityModule contract address
   * @param {string} hatId - The hat ID to claim (as string/BigInt)
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async claimVouchedHat(contractAddress, hatId, options = {}) {
    requireAddress(contractAddress, 'EligibilityModule contract address');

    if (!hatId) {
      throw new Error('Hat ID is required');
    }

    const contract = this.factory.createWritable(contractAddress, EligibilityModuleABI);

    console.log('[EligibilityService] Claiming hat:', hatId);
    console.log('[EligibilityService] Contract address:', contractAddress);

    return this.txManager.execute(contract, 'claimVouchedHat', [hatId], options);
  }

  /**
   * Vouch for a user to help them claim a hat
   * @param {string} contractAddress - EligibilityModule contract address
   * @param {string} wearerAddress - Address of the user to vouch for
   * @param {string} hatId - The hat ID being vouched for
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async vouchFor(contractAddress, wearerAddress, hatId, options = {}) {
    requireAddress(contractAddress, 'EligibilityModule contract address');
    requireAddress(wearerAddress, 'Wearer address');

    if (!hatId) {
      throw new Error('Hat ID is required');
    }

    const contract = this.factory.createWritable(contractAddress, EligibilityModuleABI);

    console.log('[EligibilityService] Vouching for:', wearerAddress);
    console.log('[EligibilityService] Hat ID:', hatId);

    return this.txManager.execute(contract, 'vouchFor', [wearerAddress, hatId], options);
  }

  /**
   * Revoke a previous vouch for a user
   * @param {string} contractAddress - EligibilityModule contract address
   * @param {string} wearerAddress - Address of the user whose vouch to revoke
   * @param {string} hatId - The hat ID for which to revoke the vouch
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async revokeVouch(contractAddress, wearerAddress, hatId, options = {}) {
    requireAddress(contractAddress, 'EligibilityModule contract address');
    requireAddress(wearerAddress, 'Wearer address');

    if (!hatId) {
      throw new Error('Hat ID is required');
    }

    const contract = this.factory.createWritable(contractAddress, EligibilityModuleABI);

    console.log('[EligibilityService] Revoking vouch for:', wearerAddress);
    console.log('[EligibilityService] Hat ID:', hatId);

    return this.txManager.execute(contract, 'revokeVouch', [wearerAddress, hatId], options);
  }
}

/**
 * Create an EligibilityService instance
 * @param {ContractFactory} factory - Contract factory
 * @param {TransactionManager} txManager - Transaction manager
 * @returns {EligibilityService}
 */
export function createEligibilityService(factory, txManager) {
  return new EligibilityService(factory, txManager);
}
