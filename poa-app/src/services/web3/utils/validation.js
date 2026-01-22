/**
 * Validation Utilities
 * Input validation for Web3 operations
 */

import { ethers } from 'ethers';

/**
 * Validate that a value is a non-empty string
 * @param {*} value - Value to check
 * @param {string} name - Name for error message
 * @throws {Error} If validation fails
 */
export function requireString(value, name) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${name} is required and must be a non-empty string`);
  }
}

/**
 * Validate that a value is a valid Ethereum address
 * @param {string} address - Address to validate
 * @param {string} [name='Address'] - Name for error message
 * @throws {Error} If validation fails
 */
export function requireAddress(address, name = 'Address') {
  if (!address || !ethers.utils.isAddress(address)) {
    throw new Error(`${name} must be a valid Ethereum address`);
  }
}

/**
 * Validate that a value is a positive number
 * @param {number|string} value - Value to check (can be number or numeric string)
 * @param {string} name - Name for error message
 * @throws {Error} If validation fails
 */
export function requirePositiveNumber(value, name) {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
}

/**
 * Validate that a value is a non-negative number
 * @param {number|string} value - Value to check (can be number or numeric string)
 * @param {string} name - Name for error message
 * @throws {Error} If validation fails
 */
export function requireNonNegativeNumber(value, name) {
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }
}

/**
 * Validate that a value is an array
 * @param {*} value - Value to check
 * @param {string} name - Name for error message
 * @throws {Error} If validation fails
 */
export function requireArray(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`${name} must be an array`);
  }
}

/**
 * Validate that a value is a non-empty array
 * @param {*} value - Value to check
 * @param {string} name - Name for error message
 * @throws {Error} If validation fails
 */
export function requireNonEmptyArray(value, name) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${name} must be a non-empty array`);
  }
}

/**
 * Validate voting weights sum to 100
 * @param {number[]} weights - Array of weights
 * @throws {Error} If weights don't sum to 100
 */
export function requireValidVoteWeights(weights) {
  requireNonEmptyArray(weights, 'Vote weights');

  const total = weights.reduce((sum, w) => sum + Number(w), 0);
  if (total !== 100) {
    throw new Error(`Vote weights must sum to 100 (got ${total})`);
  }

  for (const weight of weights) {
    if (typeof weight !== 'number' || weight < 0 || weight > 100) {
      throw new Error('Each weight must be a number between 0 and 100');
    }
  }
}

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @param {number} [minLength=3] - Minimum length
 * @param {number} [maxLength=32] - Maximum length
 * @throws {Error} If validation fails
 */
export function requireValidUsername(username, minLength = 3, maxLength = 32) {
  requireString(username, 'Username');

  if (username.length < minLength) {
    throw new Error(`Username must be at least ${minLength} characters`);
  }

  if (username.length > maxLength) {
    throw new Error(`Username must be at most ${maxLength} characters`);
  }

  // Check for valid characters (alphanumeric and underscores)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('Username can only contain letters, numbers, and underscores');
  }
}

/**
 * Validate proposal duration
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} [minMinutes=1] - Minimum duration
 * @param {number} [maxMinutes=43200] - Maximum duration (30 days)
 * @throws {Error} If validation fails
 */
export function requireValidDuration(durationMinutes, minMinutes = 1, maxMinutes = 43200) {
  requirePositiveNumber(durationMinutes, 'Duration');

  if (durationMinutes < minMinutes) {
    throw new Error(`Duration must be at least ${minMinutes} minute(s)`);
  }

  if (durationMinutes > maxMinutes) {
    throw new Error(`Duration must be at most ${maxMinutes} minutes (${maxMinutes / 60 / 24} days)`);
  }
}

/**
 * Validate task payout
 * @param {number|string} payout - Payout amount
 * @throws {Error} If validation fails
 */
export function requireValidPayout(payout) {
  const payoutNum = Number(payout);
  if (isNaN(payoutNum) || payoutNum < 0) {
    throw new Error('Payout must be a non-negative number');
  }
}

/**
 * Validate IPFS CID format
 * @param {string} cid - IPFS CID to validate
 * @returns {boolean} True if valid
 */
export function isValidIpfsCid(cid) {
  if (!cid || typeof cid !== 'string') return false;
  // Skip hex strings (bytes from subgraph)
  if (cid.startsWith('0x')) return false;
  // Valid CIDs start with Qm (v0) or ba (v1)
  return cid.startsWith('Qm') || cid.startsWith('ba');
}

/**
 * Validate that IPFS CID is valid
 * @param {string} cid - CID to validate
 * @param {string} [name='IPFS CID'] - Name for error message
 * @throws {Error} If validation fails
 */
export function requireValidIpfsCid(cid, name = 'IPFS CID') {
  if (!isValidIpfsCid(cid)) {
    throw new Error(`${name} is invalid. Must start with 'Qm' or 'ba'`);
  }
}
