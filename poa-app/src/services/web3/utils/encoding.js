/**
 * Encoding Utilities
 * Helper functions for encoding/decoding blockchain data
 */

import { ethers } from 'ethers';
import bs58 from 'bs58';

/**
 * Convert a string to UTF-8 bytes
 * @param {string} str - String to convert
 * @returns {Uint8Array} UTF-8 encoded bytes
 */
export function stringToBytes(str) {
  return ethers.utils.toUtf8Bytes(str);
}

/**
 * Convert bytes to string
 * @param {Uint8Array} bytes - Bytes to decode
 * @returns {string} Decoded string
 */
export function bytesToString(bytes) {
  return ethers.utils.toUtf8String(bytes);
}

/**
 * Convert a string to its keccak256 hash (bytes32)
 * Used for descriptions, submissions, etc.
 * @param {string} str - String to hash
 * @returns {string} Keccak256 hash as hex string
 */
export function stringToBytes32(str) {
  if (!str) return ethers.constants.HashZero;
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str));
}

/**
 * Encode IPFS CIDv0 (Qm...) to bytes32
 *
 * CIDv0 = base58(0x1220 + 32-byte-sha256-hash)
 * We store just the 32-byte hash portion, which fits in bytes32
 *
 * @param {string} cid - IPFS CIDv0 string
 * @returns {string} bytes32 hex string
 */
export function ipfsCidToBytes32(cid) {
  console.log('=== ipfsCidToBytes32 DEBUG ===');
  console.log('Input CID:', cid);
  console.log('CID type:', typeof cid);

  if (!cid || cid === '') {
    console.log('Result: HashZero (empty input)');
    return ethers.constants.HashZero;
  }

  // Validate CID format
  if (!cid.startsWith('Qm')) {
    console.warn('Warning: CID does not start with "Qm" (not CIDv0):', cid);
    // If it's already a hex bytes32, return as-is
    if (cid.startsWith('0x') && cid.length === 66) {
      console.log('Result: Already bytes32, returning as-is');
      return cid;
    }
    // Otherwise, hash it as a fallback
    console.log('Fallback: Hashing string to bytes32');
    return stringToBytes32(cid);
  }

  try {
    // Decode base58 CID, skip 2-byte multihash prefix (0x12 0x20), get 32-byte hash
    const decoded = bs58.decode(cid);
    console.log('Decoded bytes length:', decoded.length);
    console.log('First 4 bytes (hex):', ethers.utils.hexlify(decoded.slice(0, 4)));

    const hashBytes = decoded.slice(2); // Skip the 0x12 0x20 prefix
    console.log('Hash bytes length:', hashBytes.length);

    const result = ethers.utils.hexlify(hashBytes);
    console.log('Result bytes32:', result);
    console.log('=== END ipfsCidToBytes32 DEBUG ===');
    return result;
  } catch (error) {
    console.error('Failed to encode IPFS CID to bytes32:', error);
    console.log('Fallback: Returning HashZero');
    console.log('=== END ipfsCidToBytes32 DEBUG ===');
    return ethers.constants.HashZero;
  }
}

/**
 * Decode bytes32 back to IPFS CIDv0
 *
 * @param {string} bytes32Hash - bytes32 hex string
 * @returns {string|null} IPFS CIDv0 string or null if invalid
 */
export function bytes32ToIpfsCid(bytes32Hash) {
  if (!bytes32Hash || bytes32Hash === ethers.constants.HashZero) return null;

  try {
    // Prepend multihash prefix (0x1220 = sha2-256, 32 bytes)
    const hashBytes = ethers.utils.arrayify(bytes32Hash);
    const withPrefix = new Uint8Array([0x12, 0x20, ...hashBytes]);
    return bs58.encode(withPrefix);
  } catch (error) {
    console.warn('Failed to decode bytes32 to IPFS CID:', error);
    return null;
  }
}

/**
 * Parse a task ID from subgraph format
 *
 * Subgraph may return IDs like "orgId-taskId"
 * Contract expects just the numeric taskId
 *
 * @param {string|number} taskId - Task ID (possibly prefixed)
 * @returns {string} Parsed task ID
 */
export function parseTaskId(taskId) {
  const taskIdStr = taskId.toString();
  return taskIdStr.includes('-') ? taskIdStr.split('-')[1] : taskIdStr;
}

/**
 * Parse a module ID from subgraph format
 * @param {string|number} moduleId - Module ID (possibly prefixed)
 * @returns {string} Parsed module ID
 */
export function parseModuleId(moduleId) {
  const moduleIdStr = moduleId.toString();
  return moduleIdStr.includes('-') ? moduleIdStr.split('-')[1] : moduleIdStr;
}

/**
 * Parse a project ID from subgraph format or string
 *
 * The subgraph stores project IDs as "{contractAddress}-{projectId}"
 * where projectId is a bytes32 hex string (the actual project ID from the contract).
 * The contract uses auto-incrementing numeric IDs stored as bytes32.
 *
 * @param {string} projectId - Project ID (subgraph format or raw bytes32)
 * @returns {string} bytes32 project ID
 */
export function parseProjectId(projectId) {
  console.log('=== parseProjectId DEBUG ===');
  console.log('Input projectId:', projectId);

  if (!projectId) {
    console.log('Result: HashZero (null input)');
    return ethers.constants.HashZero;
  }

  // If already a bytes32 hex string, return as-is
  if (projectId.startsWith('0x') && projectId.length === 66) {
    console.log('Result: Already bytes32, returning as-is');
    return projectId;
  }

  // Check for subgraph format: "{contractAddress}-{projectId}"
  // Contract address is 42 chars (0x + 40 hex), projectId is 66 chars (0x + 64 hex)
  // Format: "0x1234...-0x0000..."
  const subgraphPattern = /^0x[a-fA-F0-9]{40}-(.+)$/;
  const match = projectId.match(subgraphPattern);
  console.log('Subgraph pattern match:', match);

  if (match) {
    const extractedId = match[1];
    console.log('Extracted ID:', extractedId);

    // If the extracted part is already a valid bytes32, return it
    if (extractedId.startsWith('0x') && extractedId.length === 66) {
      console.log('Result: Extracted bytes32 from subgraph format');
      return extractedId;
    }
    // If it's a hex string without 0x prefix, add it and pad to bytes32
    if (/^[a-fA-F0-9]+$/.test(extractedId)) {
      const padded = ethers.utils.hexZeroPad('0x' + extractedId, 32);
      console.log('Result: Padded hex to bytes32:', padded);
      return padded;
    }
  }

  // Legacy: if it's a plain string name, hash it (for backwards compatibility)
  const hashed = stringToBytes32(projectId);
  console.log('Result: Hashed string (legacy):', hashed);
  return hashed;
}

/**
 * Format an address for display (shortened)
 * @param {string} address - Full address
 * @param {number} [chars=4] - Characters to show on each side
 * @returns {string} Formatted address (e.g., "0x1234...5678")
 */
export function formatAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Check if a string is a valid Ethereum address
 * @param {string} address - Address to check
 * @returns {boolean} True if valid
 */
export function isValidAddress(address) {
  return ethers.utils.isAddress(address);
}

/**
 * Get checksum address
 * @param {string} address - Address to checksum
 * @returns {string} Checksummed address
 */
export function toChecksumAddress(address) {
  return ethers.utils.getAddress(address);
}
