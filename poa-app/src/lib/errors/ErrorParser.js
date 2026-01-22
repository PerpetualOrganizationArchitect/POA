/**
 * Error Parser
 * Parses blockchain errors into user-friendly messages
 */

import { ethers } from 'ethers';
import { Web3ErrorCategory, TransactionError } from './Web3Error';

/**
 * Known custom error selectors (4-byte function selectors)
 * These are keccak256(errorSignature)[0:4]
 * Add more as needed
 */
const CUSTOM_ERROR_SELECTORS = {
  '0x48cbf26d': 'TargetNotAllowed',  // keccak256("TargetNotAllowed()")
  '0xb7c6d77a': 'TargetSelf',        // keccak256("TargetSelf()")
  '0x82b42900': 'Unauthorized',       // keccak256("Unauthorized()")
  '0x8a0fcb60': 'AlreadyVoted',       // keccak256("AlreadyVoted()")
  '0x47031d84': 'VotingExpired',      // keccak256("VotingExpired()")
  '0x59120e37': 'VotingOpen',         // keccak256("VotingOpen()")
  '0x89a89086': 'InvalidQuorum',      // keccak256("InvalidQuorum()")
  '0xd4e6f304': 'RoleNotAllowed',     // keccak256("RoleNotAllowed()")
  '0x9996b315': 'BadStatus',          // keccak256("BadStatus()")
  '0xb6c3e8f0': 'NotClaimer',         // keccak256("NotClaimer()")
  '0x82d5d76a': 'InvalidTarget',      // keccak256("InvalidTarget()")

  // ParticipationToken errors
  '0x291fc442': 'NotMember',          // keccak256("NotMember()")
  '0x1f2a2005': 'ZeroAmount',         // keccak256("ZeroAmount()")
  '0x65f84cc0': 'NotApprover',        // keccak256("NotApprover()")
  '0x101f817a': 'AlreadyApproved',    // keccak256("AlreadyApproved()")
  '0x36838924': 'RequestUnknown',     // keccak256("RequestUnknown()")
  '0xe39da59e': 'NotRequester',       // keccak256("NotRequester()")
  '0xa741a045': 'AlreadySet',         // keccak256("AlreadySet()")
  '0xe6c4247b': 'InvalidAddress',     // keccak256("InvalidAddress()")
  '0x8574adcf': 'TransfersDisabled',  // keccak256("TransfersDisabled()")
};

/**
 * Try to decode a custom error from its 4-byte selector
 * @param {string} errorData - Error data hex string
 * @returns {string|null} Error name or null
 */
function decodeCustomErrorSelector(errorData) {
  if (!errorData || typeof errorData !== 'string') return null;

  // Extract first 4 bytes (10 chars including 0x)
  const selector = errorData.slice(0, 10).toLowerCase();
  return CUSTOM_ERROR_SELECTORS[selector] || null;
}

/**
 * Common contract revert patterns and their user-friendly messages
 * Add more patterns as you discover them in your contracts
 */
const REVERT_PATTERNS = {
  // Account Registry errors
  'Already registered': 'You already have an account registered.',
  'Username taken': 'This username is already taken. Please choose another.',
  'Username too short': 'Username must be at least 3 characters.',
  'Username too long': 'Username must be less than 32 characters.',

  // Membership errors
  'Not a member': 'You must be a member of this organization.',
  'Already a member': 'You are already a member of this organization.',
  'Unauthorized': 'You do not have permission for this action.',
  'Insufficient permissions': 'You do not have the required permissions.',

  // Voting errors
  'Proposal expired': 'This proposal has expired.',
  'Already voted': 'You have already voted on this proposal.',
  'Voting not started': 'Voting has not started yet.',
  'Voting ended': 'Voting has ended for this proposal.',
  'Invalid vote weight': 'Vote weights must sum to 100.',
  'AlreadyVoted': 'You have already voted on this proposal.',
  'VotingExpired': 'Voting has ended for this proposal.',
  'VotingOpen': 'Voting is still in progress.',
  'InvalidQuorum': 'Invalid quorum percentage (must be 1-100).',
  'DurationOutOfRange': 'Vote duration is out of allowed range.',
  'TooManyOptions': 'Too many voting options.',
  'TooManyCalls': 'Too many calls in execution batch.',
  'RoleNotAllowed': 'Your role is not allowed to perform this action.',
  'TargetNotAllowed': 'The target contract is not in the allowed targets list. The organization admin needs to add this contract to the voting allowlist.',
  'TargetSelf': 'A voting contract cannot create proposals that target itself. Use the other voting contract.',
  'InvalidTarget': 'The target contract is not whitelisted for execution. The organization needs to add this contract to the voting allowlist via a governance proposal.',
  'WeightSumNot100': 'Vote weights must sum to 100.',
  'LengthMismatch': 'Array lengths do not match.',
  'DuplicateIndex': 'Duplicate option index in vote.',
  'InvalidProposal': 'Invalid proposal.',

  // Task errors (legacy string patterns)
  'Task already claimed': 'This task has already been claimed.',
  'Task not claimed': 'This task has not been claimed yet.',
  'Not task claimer': 'Only the task claimer can perform this action.',
  'Task completed': 'This task has already been completed.',
  'Invalid task': 'This task does not exist.',
  'Project not found': 'This project does not exist.',

  // TaskManager custom errors (POP contracts)
  'BadStatus': 'Task is not in the correct state for this action.',
  'NotClaimer': 'Only the person who claimed this task can perform this action.',
  'NotFound': 'This task does not exist.',
  'NotCreator': 'You don\'t have permission to create projects. Contact your organization admin to get creator permissions.',
  'NotExecutor': 'Unauthorized: caller is not the executor.',
  'AlreadyApplied': 'You have already applied for this task.',
  'NoApplicationRequired': 'This task does not require an application.',
  'NotApplicant': 'You have not applied for this task.',
  'RequiresApplication': 'This task requires an application before claiming.',
  'BudgetExceeded': 'Project budget has been exceeded.',
  'EmptyTitle': 'Task title cannot be empty.',
  'TitleTooLong': 'Task title is too long.',
  'InvalidPayout': 'Invalid payout amount.',
  'InvalidString': 'Invalid string input.',
  'ZeroAddress': 'Address cannot be zero.',
  'CapBelowCommitted': 'Cap cannot be lower than committed amount.',
  'SpentUnderflow': 'Spent amount underflow.',
  'InvalidIndex': 'Invalid index.',

  // Token errors
  'Insufficient balance': 'Insufficient token balance for this operation.',
  'Transfer failed': 'Token transfer failed.',

  // General errors
  'Paused': 'This contract is currently paused.',
  'Not owner': 'Only the owner can perform this action.',

  // ParticipationToken errors
  'NotMember': 'You must be a member of this organization to request tokens. Please ensure you have been assigned a member role.',
  'ZeroAmount': 'Token amount must be greater than zero.',
  'NotApprover': 'You do not have permission to approve token requests.',
  'AlreadyApproved': 'This token request has already been approved.',
  'RequestUnknown': 'This token request does not exist.',
  'NotRequester': 'Only the original requester can cancel this request.',
  'AlreadySet': 'This value has already been configured.',
  'InvalidAddress': 'Invalid address provided.',
  'TransfersDisabled': 'Token transfers are disabled for participation tokens.',
};

/**
 * Parse error reason from various error formats
 * @param {Error} error - Original error
 * @returns {string|null} Parsed reason or null
 */
function extractRevertReason(error) {
  // Direct reason
  if (error.reason) {
    return error.reason.replace('execution reverted: ', '');
  }

  // Nested error reason
  if (error.error?.reason) {
    return error.error.reason.replace('execution reverted: ', '');
  }

  // Error data message
  if (error.error?.data?.message) {
    return error.error.data.message.replace('execution reverted: ', '');
  }

  // Try to extract from message
  if (error.message) {
    const match = error.message.match(/reverted with reason string '([^']+)'/);
    if (match) return match[1];

    const revertMatch = error.message.match(/execution reverted: (.+)/);
    if (revertMatch) return revertMatch[1];
  }

  return null;
}

/**
 * Try to decode custom error using ABI
 * @param {Error} error - Original error
 * @param {Array} [abi] - Contract ABI
 * @returns {Object|null} Decoded error or null
 */
function tryDecodeCustomError(error, abi) {
  if (!abi || !error.data) return null;

  try {
    const iface = new ethers.utils.Interface(abi);
    const decodedError = iface.parseError(error.data);
    return {
      name: decodedError.name,
      args: decodedError.args,
      signature: decodedError.signature,
    };
  } catch {
    return null;
  }
}

/**
 * Get user-friendly message from revert reason
 * @param {string} reason - Revert reason
 * @returns {string|null} User-friendly message or null
 */
function matchRevertPattern(reason) {
  if (!reason) return null;

  const lowerReason = reason.toLowerCase();

  for (const [pattern, message] of Object.entries(REVERT_PATTERNS)) {
    if (lowerReason.includes(pattern.toLowerCase())) {
      return message;
    }
  }

  return null;
}

/**
 * Parsed error result
 */
export class ParsedError {
  /**
   * @param {string} category - Error category
   * @param {string} userMessage - User-friendly message
   * @param {string} technicalMessage - Technical details
   * @param {Error} originalError - Original error
   */
  constructor(category, userMessage, technicalMessage, originalError) {
    this.category = category;
    this.userMessage = userMessage;
    this.technicalMessage = technicalMessage;
    this.originalError = originalError;
    this.timestamp = Date.now();
  }

  /**
   * Check if user rejected the transaction
   * @returns {boolean}
   */
  isUserRejection() {
    return this.category === Web3ErrorCategory.USER_REJECTED;
  }

  /**
   * Check if error is recoverable
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
 * Parse blockchain error into user-friendly format
 * @param {Error} error - Original error from ethers/contract
 * @param {Array} [abi] - Optional ABI for custom error decoding
 * @returns {ParsedError} Parsed error with category and messages
 */
export function parseError(error, abi = null) {
  // Detect category
  const category = TransactionError.detectCategory(error);

  // User rejection - simple message
  if (category === Web3ErrorCategory.USER_REJECTED) {
    return new ParsedError(
      category,
      'Transaction cancelled.',
      'User rejected the transaction',
      error
    );
  }

  // Insufficient funds
  if (category === Web3ErrorCategory.INSUFFICIENT_FUNDS) {
    return new ParsedError(
      category,
      'Insufficient funds for this transaction.',
      'Account balance too low for gas + value',
      error
    );
  }

  // Network errors
  if (category === Web3ErrorCategory.NETWORK_ERROR) {
    return new ParsedError(
      category,
      'Network error. Please check your connection and try again.',
      error.message,
      error
    );
  }

  // Gas estimation failed - try to get revert reason
  if (category === Web3ErrorCategory.GAS_ESTIMATION_FAILED) {
    let reason = extractRevertReason(error);
    let userMessage = matchRevertPattern(reason);

    // Try to decode custom error from error data if no reason found
    if (!userMessage) {
      const errorData = error.error?.data?.data || error.data;
      if (errorData) {
        const customErrorName = decodeCustomErrorSelector(errorData);
        if (customErrorName) {
          reason = customErrorName;
          userMessage = matchRevertPattern(customErrorName);
        }
      }
    }

    return new ParsedError(
      category,
      userMessage || 'Transaction would fail. Please check your inputs.',
      reason || 'Gas estimation failed',
      error
    );
  }

  // Contract revert - try to extract and match reason
  if (category === Web3ErrorCategory.CONTRACT_REVERT) {
    const reason = extractRevertReason(error);
    let userMessage = matchRevertPattern(reason);

    // Try custom error decoding
    if (!userMessage && abi) {
      const decoded = tryDecodeCustomError(error, abi);
      if (decoded) {
        // Check if we have a user-friendly message for this custom error name
        userMessage = matchRevertPattern(decoded.name) || `Contract error: ${decoded.name}`;
      }
    }

    // Fallback to generic revert message
    if (!userMessage) {
      userMessage = reason
        ? `Transaction failed: ${reason}`
        : 'Transaction rejected by the contract.';
    }

    return new ParsedError(
      category,
      userMessage,
      reason || 'Contract revert',
      error
    );
  }

  // Unknown error
  return new ParsedError(
    Web3ErrorCategory.UNKNOWN,
    'An unexpected error occurred. Please try again.',
    error.message || 'Unknown error',
    error
  );
}

/**
 * Create a ParsedError from any error
 * @param {Error|string} error - Error or error message
 * @returns {ParsedError}
 */
export function createParsedError(error) {
  if (error instanceof ParsedError) return error;

  if (typeof error === 'string') {
    return new ParsedError(
      Web3ErrorCategory.UNKNOWN,
      error,
      error,
      new Error(error)
    );
  }

  return parseError(error);
}
