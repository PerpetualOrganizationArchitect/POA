/**
 * Base Application Error
 * All custom errors should extend this class
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {string} code - Error code for programmatic handling
   * @param {Object} [details={}] - Additional error details
   */
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error for logging/transport
   * @returns {Object} Serialized error object
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }

  /**
   * Create user-friendly error message
   * @returns {string} User-friendly message
   */
  toUserMessage() {
    return this.message;
  }
}

/**
 * Error codes for general application errors
 */
export const AppErrorCodes = {
  UNKNOWN: 'UNKNOWN',
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NETWORK: 'NETWORK',
};
