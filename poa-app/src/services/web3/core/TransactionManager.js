/**
 * TransactionManager
 * Unified transaction handling with gas estimation, error parsing, and state tracking
 */

import { parseError, Web3ErrorCategory } from '@/lib/errors';
import { calculateGasLimit, getDefaultGasPrice, createGasOptions } from '@/config';

/**
 * Transaction states for tracking progress
 */
export const TransactionState = {
  IDLE: 'idle',
  ESTIMATING: 'estimating',
  AWAITING_SIGNATURE: 'awaiting_signature',
  PENDING: 'pending',
  CONFIRMING: 'confirming',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Transaction result object
 */
export class TransactionResult {
  /**
   * @param {boolean} success - Whether transaction succeeded
   * @param {Object} [receipt=null] - Transaction receipt
   * @param {Object} [error=null] - Parsed error if failed
   */
  constructor(success, receipt = null, error = null) {
    this.success = success;
    this.receipt = receipt;
    this.error = error;
    this.txHash = receipt?.transactionHash;
    this.blockNumber = receipt?.blockNumber;
    this.timestamp = Date.now();
  }

  /**
   * Create a successful result
   * @param {Object} receipt - Transaction receipt
   * @returns {TransactionResult}
   */
  static success(receipt) {
    return new TransactionResult(true, receipt, null);
  }

  /**
   * Create a failed result
   * @param {Object} error - Parsed error object
   * @returns {TransactionResult}
   */
  static failure(error) {
    return new TransactionResult(false, null, error);
  }
}

/**
 * Default transaction options
 */
const DEFAULT_OPTIONS = {
  isDelete: false, // Use higher gas multiplier for delete operations
  confirmations: 1, // Number of block confirmations to wait
  onStateChange: null, // Callback for state changes: (state, data) => {}
};

/**
 * TransactionManager - Handles the full transaction lifecycle
 *
 * This eliminates the 15+ repeated transaction patterns by providing
 * a single, unified method for executing contract transactions.
 */
export class TransactionManager {
  /**
   * @param {ethers.Signer} signer - Ethers signer
   * @param {Object} [config={}] - Configuration options
   */
  constructor(signer, config = {}) {
    this.signer = signer;
    this.gasPrice = config.gasPrice || getDefaultGasPrice();
  }

  /**
   * Execute a contract transaction with full lifecycle management
   *
   * @param {ethers.Contract} contract - Contract instance
   * @param {string} method - Method name to call
   * @param {Array} [args=[]] - Method arguments
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>} Transaction result
   */
  async execute(contract, method, args = [], options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const abi = contract.interface?.fragments;

    try {
      // State: Estimating gas
      this._notifyState(opts.onStateChange, TransactionState.ESTIMATING);

      // Estimate gas
      const gasEstimate = await this._estimateGas(contract, method, args);
      const gasOptions = createGasOptions(gasEstimate, {
        isDelete: opts.isDelete,
        gasPrice: this.gasPrice,
      });

      // State: Awaiting signature
      this._notifyState(opts.onStateChange, TransactionState.AWAITING_SIGNATURE);

      // Send transaction
      const tx = await contract[method](...args, gasOptions);

      // State: Pending
      this._notifyState(opts.onStateChange, TransactionState.PENDING, {
        txHash: tx.hash,
      });

      console.log(`Transaction sent: ${tx.hash}`);

      // State: Confirming
      this._notifyState(opts.onStateChange, TransactionState.CONFIRMING);

      // Wait for confirmation
      const receipt = await tx.wait(opts.confirmations);

      // State: Success
      this._notifyState(opts.onStateChange, TransactionState.SUCCESS, {
        receipt,
        txHash: tx.hash,
      });

      console.log(`Transaction confirmed: ${receipt.transactionHash} (block ${receipt.blockNumber})`);

      return TransactionResult.success(receipt);

    } catch (error) {
      // Enhanced error logging for debugging
      console.error('=== TRANSACTION ERROR DEBUG ===');
      console.error('Method:', method);
      console.error('Args:', args);
      console.error('Raw error:', error);
      console.error('Error message:', error.message);
      console.error('Error reason:', error.reason);
      console.error('Error code:', error.code);
      console.error('Error data:', error.data);
      console.error('Nested error:', error.error);
      console.error('Nested error data:', error.error?.data);
      console.error('Nested error message:', error.error?.message);
      console.error('=== END TRANSACTION ERROR DEBUG ===');

      const parsedError = parseError(error, abi);

      // State: Error
      this._notifyState(opts.onStateChange, TransactionState.ERROR, {
        error: parsedError,
      });

      console.error(`Transaction failed: ${method}`, parsedError.technicalMessage);
      console.error('Parsed error category:', parsedError.category);
      console.error('Parsed error userMessage:', parsedError.userMessage);

      return TransactionResult.failure(parsedError);
    }
  }

  /**
   * Execute multiple transactions in sequence
   *
   * @param {Array<{contract, method, args, options}>} transactions - Array of transaction configs
   * @param {Object} [batchOptions={}] - Options for the batch
   * @returns {Promise<Array<TransactionResult>>} Array of results
   */
  async executeBatch(transactions, batchOptions = {}) {
    const results = [];

    for (const tx of transactions) {
      const result = await this.execute(
        tx.contract,
        tx.method,
        tx.args || [],
        { ...batchOptions, ...tx.options }
      );

      results.push(result);

      // Stop on first failure unless continueOnError is set
      if (!result.success && !batchOptions.continueOnError) {
        break;
      }
    }

    return results;
  }

  /**
   * Estimate gas for a contract call
   * @param {ethers.Contract} contract - Contract instance
   * @param {string} method - Method name
   * @param {Array} args - Method arguments
   * @returns {Promise<BigNumber>} Gas estimate
   */
  async _estimateGas(contract, method, args) {
    try {
      return await contract.estimateGas[method](...args);
    } catch (error) {
      // Gas estimation failure usually means the transaction would revert
      // Re-throw with the original error for proper parsing
      throw error;
    }
  }

  /**
   * Update gas price
   * @param {BigNumber} gasPrice - New gas price
   */
  updateGasPrice(gasPrice) {
    this.gasPrice = gasPrice;
  }

  /**
   * Update signer
   * @param {ethers.Signer} signer - New signer
   */
  updateSigner(signer) {
    this.signer = signer;
  }

  /**
   * Notify state change callback
   * @param {Function|null} callback - State change callback
   * @param {string} state - New state
   * @param {Object} [data={}] - Additional data
   */
  _notifyState(callback, state, data = {}) {
    if (typeof callback === 'function') {
      callback(state, data);
    }
  }
}

/**
 * Create a TransactionManager instance
 * @param {ethers.Signer} signer - Ethers signer
 * @param {Object} [config={}] - Configuration options
 * @returns {TransactionManager} Transaction manager instance
 */
export function createTransactionManager(signer, config = {}) {
  return new TransactionManager(signer, config);
}
