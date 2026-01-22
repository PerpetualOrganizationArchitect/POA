/**
 * Error Classes Module
 * Barrel exports for all error classes and utilities
 */

// Base error
export { AppError, AppErrorCodes } from './AppError';

// Web3/Blockchain errors
export {
  Web3Error,
  Web3ErrorCategory,
  TransactionError,
  ContractCreationError,
} from './Web3Error';

// IPFS errors
export {
  IPFSError,
  IPFSErrorCode,
  IPFSOperation,
} from './IPFSError';

// Error parsing utilities
export {
  ParsedError,
  parseError,
  createParsedError,
} from './ErrorParser';
