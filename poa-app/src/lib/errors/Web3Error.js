/**
 * Web3/Blockchain Error Classes
 * Handles all blockchain-related errors with proper classification
 */

import { AppError } from './AppError';

/**
 * Error categories for Web3 operations
 */
export const Web3ErrorCategory = {
  USER_REJECTED: 'USER_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONTRACT_REVERT: 'CONTRACT_REVERT',
  GAS_ESTIMATION_FAILED: 'GAS_ESTIMATION_FAILED',
  NO_SIGNER: 'NO_SIGNER',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_ABI: 'INVALID_ABI',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Base Web3 Error
 */
export class Web3Error extends AppError {
  /**
   * @param {string} message - Error message
   * @param {string} [category=UNKNOWN] - Error category
   * @param {Error} [originalError=null] - Original error that caused this
   */
  constructor(message, category = Web3ErrorCategory.UNKNOWN, originalError = null) {
    super(message, 'WEB3_ERROR', {
      category,
      originalMessage: originalError?.message,
      reason: originalError?.reason,
    });

    this.category = category;
    this.originalError = originalError;
  }

  /**
   * Check if this error was caused by user rejection
   * @returns {boolean}
   */
  isUserRejection() {
    return this.category === Web3ErrorCategory.USER_REJECTED;
  }

  /**
   * Check if this error is recoverable (user can retry)
   * @returns {boolean}
   */
  isRecoverable() {
    return [
      Web3ErrorCategory.USER_REJECTED,
      Web3ErrorCategory.NETWORK_ERROR,
      Web3ErrorCategory.GAS_ESTIMATION_FAILED,
    ].includes(this.category);
  }
}

/**
 * Transaction-specific error
 */
export class TransactionError extends Web3Error {
  /**
   * @param {string} method - Contract method that failed
   * @param {Error} originalError - Original error from ethers
   * @param {string} [category] - Error category (auto-detected if not provided)
   */
  constructor(method, originalError, category = null) {
    const detectedCategory = category || TransactionError.detectCategory(originalError);
    const userMessage = TransactionError.getUserMessage(detectedCategory, method);

    super(userMessage, detectedCategory, originalError);

    this.code = 'TRANSACTION_ERROR';
    this.method = method;
    this.txHash = originalError?.transactionHash;
  }

  /**
   * Detect error category from original error
   * @param {Error} error - Original error
   * @returns {string} Error category
   */
  static detectCategory(error) {
    if (!error) return Web3ErrorCategory.UNKNOWN;

    // User rejected transaction
    if (
      error.code === 4001 ||
      error.code === 'ACTION_REJECTED' ||
      error.message?.toLowerCase().includes('user rejected') ||
      error.message?.toLowerCase().includes('user denied')
    ) {
      return Web3ErrorCategory.USER_REJECTED;
    }

    // Insufficient funds
    if (
      error.code === 'INSUFFICIENT_FUNDS' ||
      error.message?.toLowerCase().includes('insufficient funds')
    ) {
      return Web3ErrorCategory.INSUFFICIENT_FUNDS;
    }

    // Network errors
    if (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      error.code === 'SERVER_ERROR' ||
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('timeout')
    ) {
      return Web3ErrorCategory.NETWORK_ERROR;
    }

    // Gas estimation failed (usually means tx would revert)
    if (
      error.code === 'UNPREDICTABLE_GAS_LIMIT' ||
      error.message?.toLowerCase().includes('cannot estimate gas')
    ) {
      return Web3ErrorCategory.GAS_ESTIMATION_FAILED;
    }

    // Contract revert
    if (
      error.reason ||
      error.data ||
      error.error?.reason ||
      error.message?.toLowerCase().includes('revert')
    ) {
      return Web3ErrorCategory.CONTRACT_REVERT;
    }

    return Web3ErrorCategory.UNKNOWN;
  }

  /**
   * Get user-friendly message based on category
   * @param {string} category - Error category
   * @param {string} method - Method that failed
   * @returns {string} User-friendly message
   */
  static getUserMessage(category, method) {
    const messages = {
      [Web3ErrorCategory.USER_REJECTED]: 'Transaction cancelled.',
      [Web3ErrorCategory.INSUFFICIENT_FUNDS]: 'Insufficient funds for this transaction.',
      [Web3ErrorCategory.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
      [Web3ErrorCategory.GAS_ESTIMATION_FAILED]: 'Transaction would fail. Please check your inputs.',
      [Web3ErrorCategory.CONTRACT_REVERT]: 'Transaction rejected by the contract.',
      [Web3ErrorCategory.UNKNOWN]: `Transaction failed: ${method}`,
    };

    return messages[category] || messages[Web3ErrorCategory.UNKNOWN];
  }
}

/**
 * Contract creation error
 */
export class ContractCreationError extends Web3Error {
  /**
   * @param {string} message - Error message
   * @param {string} [category=UNKNOWN] - Error category
   */
  constructor(message, category = Web3ErrorCategory.UNKNOWN) {
    super(message, category, null);
    this.code = 'CONTRACT_CREATION_ERROR';
  }

  /**
   * Create error for missing signer
   * @returns {ContractCreationError}
   */
  static noSigner() {
    return new ContractCreationError(
      'No signer available. Please connect your wallet.',
      Web3ErrorCategory.NO_SIGNER
    );
  }

  /**
   * Create error for invalid address
   * @param {string} address - The invalid address
   * @returns {ContractCreationError}
   */
  static invalidAddress(address) {
    return new ContractCreationError(
      `Invalid contract address: ${address}`,
      Web3ErrorCategory.INVALID_ADDRESS
    );
  }

  /**
   * Create error for invalid ABI
   * @returns {ContractCreationError}
   */
  static invalidAbi() {
    return new ContractCreationError(
      'Invalid or empty ABI provided.',
      Web3ErrorCategory.INVALID_ABI
    );
  }
}
