/**
 * Web3 Utilities
 * Barrel exports for encoding and validation utilities
 */

// Encoding utilities
export {
  stringToBytes,
  bytesToString,
  stringToBytes32,
  ipfsCidToBytes32,
  bytes32ToIpfsCid,
  parseTaskId,
  parseModuleId,
  parseProjectId,
  formatAddress,
  isValidAddress,
  toChecksumAddress,
} from './encoding';

// Validation utilities
export {
  requireString,
  requireAddress,
  requirePositiveNumber,
  requireNonNegativeNumber,
  requireArray,
  requireNonEmptyArray,
  requireValidVoteWeights,
  requireValidUsername,
  requireValidDuration,
  requireValidPayout,
  isValidIpfsCid,
  requireValidIpfsCid,
} from './validation';
