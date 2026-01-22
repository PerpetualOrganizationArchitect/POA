/**
 * IPFS Error Classes
 * Handles all IPFS-related errors with proper classification
 */

import { AppError } from './AppError';

/**
 * IPFS operation types
 */
export const IPFSOperation = {
  ADD: 'add',
  FETCH: 'fetch',
  FETCH_IMAGE: 'fetchImage',
  VALIDATE: 'validate',
};

/**
 * IPFS error codes
 */
export const IPFSErrorCode = {
  INVALID_CID: 'INVALID_CID',
  FETCH_FAILED: 'FETCH_FAILED',
  ADD_FAILED: 'ADD_FAILED',
  PARSE_FAILED: 'PARSE_FAILED',
  TIMEOUT: 'TIMEOUT',
  NETWORK: 'NETWORK',
  UNKNOWN: 'UNKNOWN',
};

/**
 * IPFS Error
 * Replaces silent failures (returning null) with proper error handling
 */
export class IPFSError extends AppError {
  /**
   * @param {string} operation - IPFS operation that failed
   * @param {string} [hash=null] - IPFS hash if applicable
   * @param {Error} [originalError=null] - Original error that caused this
   * @param {string} [code=UNKNOWN] - Error code
   */
  constructor(operation, hash = null, originalError = null, code = IPFSErrorCode.UNKNOWN) {
    const message = IPFSError.createMessage(operation, hash, originalError);

    super(message, code, {
      operation,
      hash,
      originalMessage: originalError?.message,
    });

    this.operation = operation;
    this.hash = hash;
    this.originalError = originalError;
  }

  /**
   * Create error message based on operation and context
   * @param {string} operation - IPFS operation
   * @param {string} [hash] - IPFS hash
   * @param {Error} [originalError] - Original error
   * @returns {string} Error message
   */
  static createMessage(operation, hash, originalError) {
    const hashInfo = hash ? ` (hash: ${hash.substring(0, 12)}...)` : '';

    const messages = {
      [IPFSOperation.ADD]: `Failed to upload content to IPFS${hashInfo}`,
      [IPFSOperation.FETCH]: `Failed to fetch content from IPFS${hashInfo}`,
      [IPFSOperation.FETCH_IMAGE]: `Failed to fetch image from IPFS${hashInfo}`,
      [IPFSOperation.VALIDATE]: `Invalid IPFS CID format${hashInfo}`,
    };

    return messages[operation] || `IPFS operation failed: ${operation}${hashInfo}`;
  }

  /**
   * Create error for invalid CID
   * @param {string} hash - The invalid hash
   * @returns {IPFSError}
   */
  static invalidCid(hash) {
    return new IPFSError(
      IPFSOperation.VALIDATE,
      hash,
      new Error('Invalid CID format. Expected CIDv0 (Qm...) or CIDv1 (ba...).'),
      IPFSErrorCode.INVALID_CID
    );
  }

  /**
   * Create error for fetch failure
   * @param {string} hash - IPFS hash
   * @param {Error} [originalError] - Original error
   * @returns {IPFSError}
   */
  static fetchFailed(hash, originalError = null) {
    return new IPFSError(
      IPFSOperation.FETCH,
      hash,
      originalError,
      IPFSErrorCode.FETCH_FAILED
    );
  }

  /**
   * Create error for add failure
   * @param {Error} [originalError] - Original error
   * @returns {IPFSError}
   */
  static addFailed(originalError = null) {
    return new IPFSError(
      IPFSOperation.ADD,
      null,
      originalError,
      IPFSErrorCode.ADD_FAILED
    );
  }

  /**
   * Create error for JSON parse failure
   * @param {string} hash - IPFS hash
   * @param {Error} [originalError] - Original error
   * @returns {IPFSError}
   */
  static parseFailed(hash, originalError = null) {
    return new IPFSError(
      IPFSOperation.FETCH,
      hash,
      originalError,
      IPFSErrorCode.PARSE_FAILED
    );
  }

  /**
   * Check if error is recoverable (worth retrying)
   * @returns {boolean}
   */
  isRecoverable() {
    return [
      IPFSErrorCode.FETCH_FAILED,
      IPFSErrorCode.ADD_FAILED,
      IPFSErrorCode.TIMEOUT,
      IPFSErrorCode.NETWORK,
    ].includes(this.code);
  }

  /**
   * Get user-friendly message
   * @returns {string}
   */
  toUserMessage() {
    const messages = {
      [IPFSErrorCode.INVALID_CID]: 'Invalid content identifier.',
      [IPFSErrorCode.FETCH_FAILED]: 'Failed to load content. Please try again.',
      [IPFSErrorCode.ADD_FAILED]: 'Failed to upload content. Please try again.',
      [IPFSErrorCode.PARSE_FAILED]: 'Content format is invalid.',
      [IPFSErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
      [IPFSErrorCode.NETWORK]: 'Network error. Please check your connection.',
      [IPFSErrorCode.UNKNOWN]: 'An unexpected error occurred.',
    };

    return messages[this.code] || messages[IPFSErrorCode.UNKNOWN];
  }
}
