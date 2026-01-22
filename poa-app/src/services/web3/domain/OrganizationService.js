/**
 * OrganizationService
 * Handles organization membership operations (QuickJoin)
 */

import QuickJoinABI from '../../../../abi/QuickJoinNew.json';
import { requireAddress, requireValidUsername } from '../utils/validation';

/**
 * OrganizationService - Organization membership management
 */
export class OrganizationService {
  /**
   * @param {ContractFactory} contractFactory - Contract factory instance
   * @param {TransactionManager} transactionManager - Transaction manager instance
   */
  constructor(contractFactory, transactionManager) {
    this.factory = contractFactory;
    this.txManager = transactionManager;
  }

  /**
   * Join an organization without an existing account (creates account + joins)
   * @param {string} contractAddress - QuickJoin contract address
   * @param {string} username - Username for new account
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async quickJoinNoUser(contractAddress, username, options = {}) {
    requireAddress(contractAddress, 'QuickJoin contract address');
    requireValidUsername(username);

    const contract = this.factory.createWritable(contractAddress, QuickJoinABI);

    console.log("Joining organization with username:", username);
    console.log("Contract address:", contractAddress);

    return this.txManager.execute(contract, 'quickJoinNoUser', [username], options);
  }

  /**
   * Join an organization with an existing account
   * @param {string} contractAddress - QuickJoin contract address
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async quickJoinWithUser(contractAddress, options = {}) {
    requireAddress(contractAddress, 'QuickJoin contract address');

    const contract = this.factory.createWritable(contractAddress, QuickJoinABI);

    return this.txManager.execute(contract, 'quickJoinWithUser', [], options);
  }
}

/**
 * Create an OrganizationService instance
 * @param {ContractFactory} factory - Contract factory
 * @param {TransactionManager} txManager - Transaction manager
 * @returns {OrganizationService}
 */
export function createOrganizationService(factory, txManager) {
  return new OrganizationService(factory, txManager);
}
